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
      select: { id: true, nombre: true, unidad: true, categoria: true },
    });

    if (!producto) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
    }

    const precios = await prisma.abastosProductoPrecio.findMany({
      where: {
        productoId,
        verificado: true,
        proveedor: { activo: true },
      },
      select: {
        proveedorId: true,
        precio: true,
        unidad: true,
        createdAt: true,
        proveedor: { select: { nombre: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const proveedores = new Map<string, { proveedorId: string; proveedorNombre: string; precio: number; unidad: string; actualizado: string }>();
    for (const p of precios) {
      if (!proveedores.has(p.proveedorId)) {
        proveedores.set(p.proveedorId, {
          proveedorId: p.proveedorId,
          proveedorNombre: p.proveedor.nombre,
          precio: Number(p.precio),
          unidad: p.unidad,
          actualizado: p.createdAt.toISOString(),
        });
      }
    }

    return NextResponse.json({
      producto: {
        id: producto.id,
        nombre: producto.nombre,
        unidad: producto.unidad,
        categoria: producto.categoria,
      },
      precios: Array.from(proveedores.values()),
    });
  } catch {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
