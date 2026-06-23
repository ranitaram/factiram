import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const productoId = (searchParams.get("productoId") || "").trim();

    if (!productoId) {
      return NextResponse.json({ error: "productoId requerido" }, { status: 400 });
    }

    const producto = await prisma.abastosProducto.findUnique({
      where: { id: productoId },
      select: { nombre: true },
    });

    if (!producto) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
    }

    const historial = await prisma.abastosProductoPrecio.findMany({
      where: {
        productoId,
        verificado: true,
        proveedor: { activo: true },
      },
      select: {
        id: true,
        precio: true,
        unidad: true,
        createdAt: true,
        proveedor: { select: { nombre: true } },
        negocio: { select: { nombre: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json({
      producto: producto.nombre,
      historial: historial.map((h) => ({
        id: h.id,
        proveedor: h.proveedor.nombre,
        precio: Number(h.precio),
        unidad: h.unidad,
        reportadoPor: h.negocio?.nombre ?? "Admin",
        fecha: h.createdAt.toISOString(),
      })),
    });
  } catch {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
