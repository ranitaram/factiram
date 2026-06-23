import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get("q") || "").trim();

    const where = q
      ? { activo: true, nombre: { contains: q, mode: "insensitive" as const } }
      : { activo: true };

    const productos = await prisma.abastosProducto.findMany({
      where,
      select: { id: true, nombre: true, unidad: true, categoria: true },
      orderBy: [{ categoria: "asc" }, { nombre: "asc" }],
    });

    return NextResponse.json({ productos });
  } catch {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
