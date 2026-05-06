import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { startOfDay, endOfDay } from "date-fns";

function fechaDia(): Date {
  const hoy = new Date();
  return new Date(Date.UTC(hoy.getUTCFullYear(), hoy.getUTCMonth(), hoy.getUTCDate()));
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const negocioId = searchParams.get("negocioId");

    if (!negocioId) {
      return NextResponse.json(
        { error: "negocioId requerido" },
        { status: 400 }
      );
    }

    const ahora = new Date();
    const inicio = startOfDay(ahora);
    const fin = endOfDay(ahora);

    // 3 queries en paralelo. groupBy y aggregate hacen el cómputo en BD —
    // no traemos filas individuales por venta/gasto.
    const [ventasAgrupadas, gastoAgg, efectivoRow] = await Promise.all([
      prisma.ventaDia.groupBy({
        by: ["productoId", "tipo"],
        where: { negocioId, fecha: { gte: inicio, lte: fin } },
        _sum: { cantidad: true, total: true },
      }),
      prisma.gastoDia.aggregate({
        where: { negocioId, fecha: { gte: inicio, lte: fin } },
        _sum: { monto: true },
      }),
      prisma.efectivoCaja.findUnique({
        where: { negocioId_fecha: { negocioId, fecha: fechaDia() } },
        select: { monto: true },
      }),
    ]);

    let piezasVendidas = 0;
    let ventasHoy = 0;
    let efectivoSistema = 0;
    const ventasPorProducto: Record<string, number> = {};

    for (const fila of ventasAgrupadas) {
      const cantidad = fila._sum.cantidad ?? 0;
      const total = Number(fila._sum.total ?? 0);
      piezasVendidas += cantidad;
      ventasHoy += total;
      ventasPorProducto[fila.productoId] =
        (ventasPorProducto[fila.productoId] ?? 0) + cantidad;
      if (fila.tipo === "EFECTIVO") {
        efectivoSistema += total;
      }
    }

    return NextResponse.json({
      ventasHoy,
      gastosHoy: Number(gastoAgg._sum.monto ?? 0),
      efectivoHoy: Number(efectivoRow?.monto ?? 0),
      efectivoSistema,
      piezasVendidas,
      ventasPorProducto,
    });
  } catch (error) {
    console.error("Error en GET /api/dashboard/resumen:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
