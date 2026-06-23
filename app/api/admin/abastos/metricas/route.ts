import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const ahora = new Date();
    const inicioHoy = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
    const inicioSemana = new Date(inicioHoy.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [eventosHoy, eventosSemana, totalProductos, preciosVerificados, ultimosPrecios, ultimosEventos] =
      await Promise.all([
        prisma.abastosEvento.groupBy({
          by: ["tipo"],
          where: { createdAt: { gte: inicioHoy } },
          _count: true,
        }),
        prisma.abastosEvento.groupBy({
          by: ["tipo"],
          where: { createdAt: { gte: inicioSemana } },
          _count: true,
        }),
        prisma.abastosProducto.count({ where: { activo: true } }),
        prisma.abastosProductoPrecio.findMany({
          where: { verificado: true, proveedor: { activo: true } },
          select: { productoId: true },
          distinct: ["productoId"],
        }),
        prisma.abastosProductoPrecio.findMany({
          where: { verificado: true, proveedor: { activo: true } },
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { createdAt: true },
        }),
        prisma.abastosEvento.findMany({
          orderBy: { createdAt: "desc" },
          take: 20,
          select: { id: true, tipo: true, metadata: true, createdAt: true },
        }),
      ]);

    const productosConPrecio = preciosVerificados.length;
    const cobertura = totalProductos > 0 ? Math.round((productosConPrecio / totalProductos) * 100) : 0;

    const productosSinPrecio = await prisma.abastosProducto.findMany({
      where: {
        activo: true,
        id: { notIn: preciosVerificados.map((p) => p.productoId) },
      },
      select: { nombre: true },
      orderBy: { nombre: "asc" },
    });

    const hoyMap = Object.fromEntries(eventosHoy.map((e) => [e.tipo, e._count]));
    const semanaMap = Object.fromEntries(eventosSemana.map((e) => [e.tipo, e._count]));

    return NextResponse.json({
      hoy: {
        busquedas: hoyMap["busqueda"] ?? 0,
        agregadosLista: hoyMap["agregar_lista"] ?? 0,
        comparaciones: hoyMap["comparar"] ?? 0,
        reportes: hoyMap["reportar"] ?? 0,
        total: eventosHoy.reduce((s, e) => s + e._count, 0),
      },
      semana: {
        busquedas: semanaMap["busqueda"] ?? 0,
        agregadosLista: semanaMap["agregar_lista"] ?? 0,
        comparaciones: semanaMap["comparar"] ?? 0,
        reportes: semanaMap["reportar"] ?? 0,
        total: eventosSemana.reduce((s, e) => s + e._count, 0),
      },
      cobertura: {
        porcentaje: cobertura,
        productosConPrecio,
        totalProductos,
      },
      productosSinPrecio: productosSinPrecio.map((p) => p.nombre),
      ultimosEventos: ultimosEventos.map((e) => ({
        id: e.id,
        tipo: e.tipo,
        metadata: e.metadata,
        fecha: e.createdAt.toISOString(),
      })),
    });
  } catch {
    return NextResponse.json({ error: "Error al obtener métricas" }, { status: 500 });
  }
}
