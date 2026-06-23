import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { isAdmin } from "@/lib/factiram-session";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const { id } = await params;
  let body: { accion?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }
  try {
    const { accion } = body;
    if (accion === "aprobar") {
      const existente = await prisma.abastosProductoPrecio.findUnique({ where: { id } });
      if (!existente) {
        return NextResponse.json({ error: "Reporte no encontrado" }, { status: 404 });
      }
      await prisma.abastosProductoPrecio.update({
        where: { id },
        data: { verificado: true },
      });
      return NextResponse.json({ ok: true });
    }
    if (accion === "rechazar") {
      const existente = await prisma.abastosProductoPrecio.findUnique({ where: { id } });
      if (!existente) {
        return NextResponse.json({ error: "Reporte no encontrado" }, { status: 404 });
      }
      await prisma.abastosProductoPrecio.delete({ where: { id } });
      return NextResponse.json({ ok: true });
    }
    return NextResponse.json({ error: "Acción inválida" }, { status: 400 });
  } catch (e: unknown) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025") {
      return NextResponse.json({ error: "Reporte no encontrado" }, { status: 404 });
    }
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
