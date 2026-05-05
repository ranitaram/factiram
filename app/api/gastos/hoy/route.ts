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

    const result = await prisma.gastoDia.aggregate({
      where: {
        negocioId,
        fecha: {
          gte: inicio,
          lte: fin,
        },
      },
      _sum: {
        monto: true,
      },
    });

    const total = Number(result._sum.monto || 0);

    return NextResponse.json({
      total,
    });
  } catch (error) {
    console.error("Error en /api/gastos/hoy:", error);

    return NextResponse.json(
      { error: "Error interno" },
      { status: 500 }
    );
  }
}