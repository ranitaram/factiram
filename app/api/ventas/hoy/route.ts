import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { startOfDay, endOfDay } from "date-fns";

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

    // 🔥 MISMO FILTRO QUE DELETE
    const result = await prisma.ventaDia.aggregate({
      _sum: {
        cantidad: true,
      },
      where: {
        negocioId,
        fecha: {
          gte: inicio,
          lte: fin,
        },
      },
    });

    const piezasVendidasHoy = result._sum.cantidad ?? 0;

    return NextResponse.json({
      piezasVendidasHoy,
    });
  } catch (error) {
    console.error("Error en GET /api/ventas/hoy:", error);
    return NextResponse.json(
      { error: "Error interno" },
      { status: 500 }
    );
  }
}