import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const proveedores = await prisma.abastosProveedor.findMany({
      where: { activo: true },
      select: { id: true, nombre: true, direccion: true, telefono: true },
      orderBy: { nombre: "asc" },
    });
    return NextResponse.json({ proveedores });
  } catch {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
