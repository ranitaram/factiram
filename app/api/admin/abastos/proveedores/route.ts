import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { isAdmin } from "@/lib/factiram-session";

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  try {
    const proveedores = await prisma.abastosProveedor.findMany({
      orderBy: { nombre: "asc" },
    });
    return NextResponse.json({ proveedores });
  } catch {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  let body: { nombre?: string; direccion?: string; telefono?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }
  try {
    const { nombre, direccion, telefono } = body;
    if (!nombre || typeof nombre !== "string" || !nombre.trim()) {
      return NextResponse.json({ error: "Nombre requerido" }, { status: 400 });
    }
    const proveedor = await prisma.abastosProveedor.create({
      data: {
        nombre: nombre.trim(),
        ...(direccion !== undefined && { direccion: direccion.trim() || null }),
        ...(telefono !== undefined && { telefono: telefono.trim() || null }),
      },
    });
    return NextResponse.json({ proveedor });
  } catch (e: unknown) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return NextResponse.json({ error: "Ya existe un proveedor con ese nombre" }, { status: 409 });
    }
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
