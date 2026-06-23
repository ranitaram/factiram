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
    if (typeof body.activo !== "boolean") {
      return NextResponse.json({ error: "activo debe ser booleano" }, { status: 400 });
    }
    const proveedor = await prisma.abastosProveedor.update({
      where: { id },
      data: { activo: body.activo },
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
