import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getPreciosActuales } from "@/lib/abastos-queries";

const MAX_Q_LENGTH = 200;
const MAX_RESULTADOS = 50;

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get("q") || "").trim().slice(0, MAX_Q_LENGTH);

    const where = q
      ? { activo: true, nombre: { contains: q, mode: "insensitive" as const } }
      : { activo: true };

    const productos = await prisma.abastosProducto.findMany({
      where,
      select: { id: true, nombre: true, unidad: true, categoria: true },
      orderBy: { nombre: "asc" },
      take: MAX_RESULTADOS,
    });

    if (!productos.length) {
      return NextResponse.json({ resultados: [] });
    }

    const productoIds = productos.map((p) => p.id);
    const preciosPorProducto = await getPreciosActuales(productoIds);

    const resultados = productos.map((prod) => ({
      productoId: prod.id,
      productoNombre: prod.nombre,
      unidad: prod.unidad,
      categoria: prod.categoria,
      precios: preciosPorProducto.get(prod.id) ?? [],
    }));

    return NextResponse.json({ resultados });
  } catch {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
