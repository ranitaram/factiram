import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { isAdmin } from "@/lib/factiram-session";

export async function POST(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  let body: { productoId?: string; proveedorId?: string; precio?: unknown; unidad?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }
  try {
    const { productoId, proveedorId, precio, unidad } = body;
    if (!productoId || !proveedorId || precio == null || !unidad) {
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 });
    }
    const precioNum = Number(precio);
    if (isNaN(precioNum) || precioNum <= 0) {
      return NextResponse.json({ error: "Precio inválido" }, { status: 400 });
    }
    const [producto, proveedor] = await Promise.all([
      prisma.abastosProducto.findUnique({ where: { id: productoId as string }, select: { id: true } }),
      prisma.abastosProveedor.findUnique({ where: { id: proveedorId as string }, select: { id: true } }),
    ]);
    if (!producto) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
    }
    if (!proveedor) {
      return NextResponse.json({ error: "Proveedor no encontrado" }, { status: 404 });
    }
    const registro = await prisma.abastosProductoPrecio.create({
      data: {
        productoId: productoId as string,
        proveedorId: proveedorId as string,
        precio: precioNum,
        unidad: unidad as string,
        verificado: true,
      },
    });
    return NextResponse.json({ registro });
  } catch (e: unknown) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === "P2003") {
        return NextResponse.json({ error: "Producto o proveedor no existe" }, { status: 404 });
      }
    }
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
