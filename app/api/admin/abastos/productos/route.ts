import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { isAdmin } from "@/lib/factiram-session";

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  try {
    const productos = await prisma.abastosProducto.findMany({
      orderBy: [{ categoria: "asc" }, { nombre: "asc" }],
    });
    return NextResponse.json({ productos });
  } catch {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  let body: { nombre?: string; unidad?: string; categoria?: string; proveedorId?: string; precio?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }
  try {
    const { nombre, unidad, categoria, proveedorId, precio } = body;
    if (!nombre || typeof nombre !== "string" || !nombre.trim()) {
      return NextResponse.json({ error: "Nombre requerido" }, { status: 400 });
    }
    const productoUnidad = unidad || "kg";

    if (proveedorId && precio && typeof precio === "number" && precio > 0) {
      const result = await prisma.$transaction(async (tx) => {
        const prod = await tx.abastosProducto.create({
          data: {
            nombre: nombre.trim(),
            unidad: productoUnidad,
            categoria: categoria || "Basicos",
          },
        });
        await tx.abastosProductoPrecio.create({
          data: {
            productoId: prod.id,
            proveedorId,
            precio,
            unidad: productoUnidad,
            verificado: true,
          },
        });
        return prod;
      });
      return NextResponse.json({ producto: result });
    }

    const producto = await prisma.abastosProducto.create({
      data: {
        nombre: nombre.trim(),
        unidad: productoUnidad,
        categoria: categoria || "Basicos",
      },
    });
    return NextResponse.json({ producto });
  } catch (e: unknown) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return NextResponse.json({ error: "Ya existe un producto con ese nombre" }, { status: 409 });
    }
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2003") {
      return NextResponse.json({ error: "Proveedor no encontrado" }, { status: 400 });
    }
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
