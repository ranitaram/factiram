import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

const CATEGORIAS_VALIDAS = ["RENTA", "LUZ_AGUA", "INTERNET", "SUELDOS", "PUBLICIDAD", "OTROS"];

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { negocioId, costos } = body;

    if (!negocioId || !Array.isArray(costos)) {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
    }

    const costosValidos = costos.filter((c: { categoria: string }) =>
      CATEGORIAS_VALIDAS.includes(c.categoria)
    );

    // Reemplazar todos los costos del negocio en una transacción
    await prisma.$transaction([
      prisma.costoFijo.deleteMany({ where: { negocioId } }),
      prisma.costoFijo.createMany({
        data: costosValidos.map((c: { categoria: string; monto: number }) => ({
          negocioId,
          categoria: c.categoria as "RENTA" | "LUZ_AGUA" | "INTERNET" | "SUELDOS" | "PUBLICIDAD" | "OTROS",
          monto: new Prisma.Decimal(c.monto >= 0 ? c.monto : 0),
        })),
      }),
    ]);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error guardando costos:", error);
    return NextResponse.json({ error: "Error al guardar costos" }, { status: 500 });
  }
}
