import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { startOfDay, endOfDay } from "date-fns";

export async function DELETE(req: Request) {
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

    // 🔥 MISMO RANGO QUE EL GET
    const venta = await prisma.ventaDia.findFirst({
      where: {
        negocioId,
        fecha: {
          gte: inicio,
          lte: fin,
        },
      },
      orderBy: {
        fecha: "desc",
      },
    });

    if (!venta) {
      return NextResponse.json(
        { error: "No hay ventas registradas hoy" },
        { status: 404 }
      );
    }

    await prisma.ventaDia.delete({
      where: { id: venta.id },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error en DELETE /api/ventas/eliminar:", error);
    return NextResponse.json(
      { error: "Error interno" },
      { status: 500 }
    );
  }
}