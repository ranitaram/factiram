import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { negocioId, monto, descripcion } = body;

    // ── Validaciones ──
    if (!negocioId) {
      return NextResponse.json(
        { error: "negocioId es requerido" },
        { status: 400 }
      );
    }

    if (monto === undefined || monto === null) {
      return NextResponse.json(
        { error: "monto es requerido" },
        { status: 400 }
      );
    }

    const montoNumber = Number(monto);

    if (isNaN(montoNumber) || montoNumber <= 0) {
      return NextResponse.json(
        { error: "Monto inválido" },
        { status: 400 }
      );
    }

    // ── Crear gasto (EVENTO) ──
    const gasto = await prisma.gastoDia.create({
      data: {
        negocioId,
        monto: new Prisma.Decimal(montoNumber),
        descripcion: descripcion?.trim() || "Caja",
      },
    });

    return NextResponse.json({
      ok: true,
      gasto,
    });
  } catch (error) {
    console.error("Error al registrar gasto:", error);

    return NextResponse.json(
      { error: "Error al registrar gasto" },
      { status: 500 }
    );
  }
}