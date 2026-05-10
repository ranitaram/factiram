import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { fechaDiaMX } from "@/lib/fecha";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const negocioId = searchParams.get("negocioId");

    if (!negocioId) {
      return NextResponse.json({ error: "negocioId requerido" }, { status: 400 });
    }

    const registro = await prisma.efectivoCaja.findUnique({
      where: { negocioId_fecha: { negocioId, fecha: fechaDiaMX() } },
    });

    return NextResponse.json({ monto: Number(registro?.monto ?? 0) });
  } catch (error) {
    console.error("Error en GET /api/efectivo/hoy:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { negocioId, monto } = body;

    if (!negocioId || typeof monto !== "number" || Number.isNaN(monto) || monto < 0) {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
    }

    const fecha = fechaDiaMX();

    const registro = await prisma.efectivoCaja.upsert({
      where: { negocioId_fecha: { negocioId, fecha } },
      create: { negocioId, fecha, monto },
      update: { monto },
    });

    return NextResponse.json({ monto: Number(registro.monto) });
  } catch (error) {
    console.error("Error en PUT /api/efectivo/hoy:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
