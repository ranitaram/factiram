import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { calcularComparacion, type ItemLista } from "@/lib/abastos-engine";
import { getPreciosActualesFlat } from "@/lib/abastos-queries";
import { trackEvent } from "@/lib/abastos-track";

const MAX_ITEMS = 20;

export async function POST(req: Request) {
  let body: { lista?: ItemLista[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  try {
    const { lista } = body;
    if (!Array.isArray(lista) || !lista.length) {
      return NextResponse.json({ error: "Lista de productos requerida" }, { status: 400 });
    }

    if (lista.length > MAX_ITEMS) {
      return NextResponse.json(
        { error: `Máximo ${MAX_ITEMS} productos por comparación` },
        { status: 400 }
      );
    }

    for (const item of lista) {
      if (!item.productoId || typeof item.cantidad !== "number" || item.cantidad <= 0) {
        return NextResponse.json(
          { error: "Cada item debe tener productoId válido y cantidad > 0" },
          { status: 400 }
        );
      }
    }

    const productoIds = [...new Set(lista.map((i) => i.productoId))];

    if (productoIds.length > MAX_ITEMS) {
      return NextResponse.json(
        { error: `Máximo ${MAX_ITEMS} productos distintos por comparación` },
        { status: 400 }
      );
    }

    const precios = await getPreciosActualesFlat(productoIds);
    const resultado = calcularComparacion(lista, precios);

    const proveedorIds = resultado.totalesProveedores.map((p) => p.proveedorId);
    const proveedores = await prisma.abastosProveedor.findMany({
      where: { id: { in: proveedorIds } },
      select: { id: true, telefono: true },
    });
    const telefonoMap = new Map(proveedores.map((p) => [p.id, p.telefono]));

    const response = {
      ...resultado,
      totalesProveedores: resultado.totalesProveedores.map((p) => ({
        ...p,
        telefono: telefonoMap.get(p.proveedorId) ?? null,
      })),
    };

    trackEvent("comparar", { items: lista.length, productos: productoIds.length });

    return NextResponse.json(response);
  } catch {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
