import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

// POST — crear nuevo producto vacío en BD y devolver el registro con ID real
export async function POST(req: Request) {
  try {
    const { negocioId } = await req.json();

    if (!negocioId) {
      return NextResponse.json({ error: "negocioId requerido" }, { status: 400 });
    }

    const producto = await prisma.producto.create({
      data: {
        negocioId,
        nombre: "Nuevo producto",
        costoCompra: new Prisma.Decimal(0),
        precioVenta: new Prisma.Decimal(0),
        piezasDia: new Prisma.Decimal(0),
      },
    });

    return NextResponse.json({
      id: producto.id,
      nombre: producto.nombre,
      costoCompra: Number(producto.costoCompra),
      precioVenta: Number(producto.precioVenta),
      piezasDia: Number(producto.piezasDia),
    });
  } catch (error) {
    console.error("Error creando producto:", error);
    return NextResponse.json({ error: "Error al crear producto" }, { status: 500 });
  }
}

// PUT — actualizar productos existentes (solo los que ya tienen ID de BD)
export async function PUT(req: Request) {
  try {
    const { negocioId, productos } = await req.json();

    if (!negocioId || !Array.isArray(productos)) {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
    }

    await Promise.all(
      productos.map((p: {
        id: string;
        nombre: string;
        costoCompra: number;
        precioVenta: number;
        piezasDia: number;
      }) =>
        prisma.producto.update({
          where: { id: p.id },
          data: {
            nombre: p.nombre.trim() || "Producto",
            costoCompra: new Prisma.Decimal(Math.max(0, p.costoCompra)),
            precioVenta: new Prisma.Decimal(Math.max(0, p.precioVenta)),
            piezasDia: new Prisma.Decimal(Math.max(0, p.piezasDia)),
            updatedAt: new Date(),
          },
        })
      )
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error actualizando productos:", error);
    return NextResponse.json({ error: "Error al actualizar productos" }, { status: 500 });
  }
}

// DELETE — marcar producto como inactivo (no eliminar para preservar historial de ventas)
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const productoId = searchParams.get("productoId");
    const negocioId = searchParams.get("negocioId");

    if (!productoId || !negocioId) {
      return NextResponse.json({ error: "productoId y negocioId requeridos" }, { status: 400 });
    }

    await prisma.producto.update({
      where: { id: productoId, negocioId },
      data: { activo: false },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error eliminando producto:", error);
    return NextResponse.json({ error: "Error al eliminar producto" }, { status: 500 });
  }
}
