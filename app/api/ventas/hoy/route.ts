import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { inicioDiaMX, finDiaMX } from "@/lib/fecha";

export const dynamic = "force-dynamic";
export const revalidate = 0;

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

    const inicio = inicioDiaMX();
    const fin = finDiaMX();

    const ventas = await prisma.ventaDia.findMany({
      where: {
        negocioId,
        fecha: { gte: inicio, lte: fin },
      },
      select: {
        productoId: true,
        cantidad: true,
        tipo: true,
        total: true,
      },
    });

    let piezasVendidasHoy = 0;
    let efectivoHoy = 0;
    const ventasPorProducto: Record<string, number> = {};

    for (const v of ventas) {
      piezasVendidasHoy += v.cantidad;
      ventasPorProducto[v.productoId] =
        (ventasPorProducto[v.productoId] ?? 0) + v.cantidad;
      if (v.tipo === "EFECTIVO") {
        efectivoHoy += Number(v.total);
      }
    }

    return NextResponse.json({
      piezasVendidasHoy,
      efectivoHoy,
      ventasPorProducto,
    });
  } catch (error) {
    console.error("Error en GET /api/ventas/hoy:", error);
    return NextResponse.json(
      { error: "Error interno" },
      { status: 500 }
    );
  }
}