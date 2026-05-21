import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

// PATCH — actualizar configuración general del negocio
// Por ahora soporta inversionMercancia; preparado para más campos a futuro.
export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { negocioId, inversionMercancia } = body as {
      negocioId?: string;
      inversionMercancia?: unknown;
    };

    if (!negocioId) {
      return NextResponse.json({ error: "negocioId requerido" }, { status: 400 });
    }

    const data: Prisma.NegocioUpdateInput = {};

    if (inversionMercancia !== undefined) {
      const num = Number(inversionMercancia);
      if (!Number.isFinite(num)) {
        return NextResponse.json(
          { error: "inversionMercancia inválida" },
          { status: 400 }
        );
      }
      data.inversionMercancia = new Prisma.Decimal(Math.max(0, num));
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "Sin cambios" }, { status: 400 });
    }

    const negocio = await prisma.negocio.update({
      where: { id: negocioId },
      data,
      select: { id: true, inversionMercancia: true },
    });

    return NextResponse.json({
      ok: true,
      inversionMercancia: Number(negocio.inversionMercancia),
    });
  } catch (error) {
    console.error("Error actualizando negocio:", error);
    return NextResponse.json(
      { error: "Error al actualizar negocio" },
      { status: 500 }
    );
  }
}
