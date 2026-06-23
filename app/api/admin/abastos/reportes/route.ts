import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { isAdmin } from "@/lib/factiram-session";

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  try {
    const reportes = await prisma.abastosProductoPrecio.findMany({
      where: { verificado: false },
      include: {
        producto: { select: { nombre: true, unidad: true } },
        proveedor: { select: { nombre: true } },
        negocio: { select: { nombre: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ reportes });
  } catch {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
