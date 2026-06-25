import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { isAdmin } from "@/lib/factiram-session";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const { id } = await params;
  try {
    const body = await req.json();
    const data: Record<string, string | boolean | null> = {};
    if (typeof body.activo === "boolean") {
      data.activo = body.activo;
    }
    if (typeof body.nombre === "string" && body.nombre.trim()) {
      data.nombre = body.nombre.trim();
    }
    if (body.direccion !== undefined) {
      data.direccion = body.direccion !== "" ? String(body.direccion).trim() : null;
    }
    if (body.telefono !== undefined) {
      data.telefono = body.telefono !== "" ? String(body.telefono).trim() : null;
    }
    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "No hay campos para actualizar" }, { status: 400 });
    }
    const proveedor = await prisma.abastosProveedor.update({
      where: { id },
      data,
    });
    return NextResponse.json({ proveedor });
  } catch (e: unknown) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025") {
      return NextResponse.json({ error: "Proveedor no encontrado" }, { status: 404 });
    }
    if (e instanceof SyntaxError) {
      return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
    }
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
