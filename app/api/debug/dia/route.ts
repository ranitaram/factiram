import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { inicioDiaMX, finDiaMX, fechaDiaMX, TIMEZONE_MX } from "@/lib/fecha";
import { getSesion } from "@/lib/factiram-session";

// Endpoint diagnóstico: muestra exactamente qué hay en BD vs el rango "hoy"
// que el sistema está aplicando, así podemos auditar discrepancias entre
// timezone del cluster y los filtros del API.
//
// Sólo lo puede consultar un usuario con sesión válida del propio negocio
// (DUENO o CAJERO) — no expone datos de otros negocios.

export const dynamic = "force-dynamic";
export const revalidate = 0;

const FORMATO_MX = new Intl.DateTimeFormat("es-MX", {
  timeZone: TIMEZONE_MX,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
});

function fechaInfo(d: Date | null | undefined) {
  if (!d) return null;
  return {
    iso_utc: d.toISOString(),
    cdmx: FORMATO_MX.format(d),
    epoch_ms: d.getTime(),
  };
}

export async function GET(req: Request) {
  const sesion = await getSesion();
  if (!sesion) {
    return NextResponse.json({ error: "Sin sesión" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const negocioId = searchParams.get("negocioId") ?? sesion.negocioId;
  if (negocioId !== sesion.negocioId) {
    return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
  }

  const ahora = new Date();
  const inicio = inicioDiaMX(ahora);
  const fin = finDiaMX(ahora);
  const fechaCajaHoy = fechaDiaMX(ahora);

  // Ventana amplia (5 días atrás) para ver registros que están "cerca" del
  // rango y diagnosticar si alguno cae mal por TZ.
  const desde = new Date(inicio.getTime() - 5 * 24 * 60 * 60 * 1000);

  const [
    pgInfo,
    ventas,
    gastos,
    efectivos,
  ] = await Promise.all([
    prisma.$queryRawUnsafe<{
      pg_now: Date;
      pg_now_utc: Date;
      pg_timezone: string;
    }[]>(
      `SELECT now() AS pg_now,
              (now() AT TIME ZONE 'UTC') AS pg_now_utc,
              current_setting('TIMEZONE') AS pg_timezone`
    ),
    prisma.ventaDia.findMany({
      where: { negocioId, fecha: { gte: desde } },
      orderBy: { fecha: "desc" },
      select: {
        id: true,
        productoId: true,
        cantidad: true,
        tipo: true,
        total: true,
        fecha: true,
      },
    }),
    prisma.gastoDia.findMany({
      where: { negocioId, fecha: { gte: desde } },
      orderBy: { fecha: "desc" },
      select: {
        id: true,
        monto: true,
        descripcion: true,
        fecha: true,
      },
    }),
    prisma.efectivoCaja.findMany({
      where: { negocioId, fecha: { gte: desde } },
      orderBy: { fecha: "desc" },
      select: {
        id: true,
        fecha: true,
        monto: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
  ]);

  const ventasDecoradas = ventas.map((v) => ({
    ...v,
    total: Number(v.total),
    fecha: fechaInfo(v.fecha),
    enRangoHoy: v.fecha >= inicio && v.fecha <= fin,
  }));
  const gastosDecorados = gastos.map((g) => ({
    ...g,
    monto: Number(g.monto),
    fecha: fechaInfo(g.fecha),
    enRangoHoy: g.fecha >= inicio && g.fecha <= fin,
  }));
  const efectivosDecorados = efectivos.map((e) => ({
    ...e,
    monto: Number(e.monto),
    fecha: fechaInfo(e.fecha),
    createdAt: fechaInfo(e.createdAt),
    updatedAt: fechaInfo(e.updatedAt),
    esLlaveHoy: e.fecha.getTime() === fechaCajaHoy.getTime(),
  }));

  return NextResponse.json({
    timezone: TIMEZONE_MX,
    server: {
      ahora_utc: ahora.toISOString(),
      ahora_cdmx: FORMATO_MX.format(ahora),
      tz_proceso: process.env.TZ ?? "(no seteada — Node usa UTC en Vercel)",
    },
    postgres: {
      pg_now: fechaInfo(pgInfo[0]?.pg_now),
      pg_now_utc: fechaInfo(pgInfo[0]?.pg_now_utc),
      pg_timezone: pgInfo[0]?.pg_timezone,
    },
    rangoHoy: {
      inicio: fechaInfo(inicio),
      fin: fechaInfo(fin),
      llaveEfectivoHoy: fechaInfo(fechaCajaHoy),
    },
    ventas: {
      total: ventasDecoradas.length,
      enRango: ventasDecoradas.filter((v) => v.enRangoHoy).length,
      filas: ventasDecoradas,
    },
    gastos: {
      total: gastosDecorados.length,
      enRango: gastosDecorados.filter((g) => g.enRangoHoy).length,
      filas: gastosDecorados,
    },
    efectivos: {
      total: efectivosDecorados.length,
      filas: efectivosDecorados,
    },
  });
}
