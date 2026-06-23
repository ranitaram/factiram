import prisma from "@/lib/prisma";
import type { PrecioActual } from "@/lib/abastos-engine";

export type PrecioPorProveedor = {
  proveedorId: string;
  proveedorNombre: string;
  precio: number;
  unidad: string;
  actualizado: string;
};

export async function getPreciosActuales(
  productoIds: string[]
): Promise<Map<string, PrecioPorProveedor[]>> {
  if (!productoIds.length) return new Map();

  const preciosDb = await prisma.abastosProductoPrecio.findMany({
    where: {
      productoId: { in: productoIds },
      verificado: true,
      proveedor: { activo: true },
    },
    select: {
      productoId: true,
      proveedorId: true,
      precio: true,
      unidad: true,
      createdAt: true,
      proveedor: { select: { nombre: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const resultado = new Map<string, PrecioPorProveedor[]>();

  for (const p of preciosDb) {
    const arr = resultado.get(p.productoId) ?? [];
    const yaExiste = arr.some((x) => x.proveedorId === p.proveedorId);
    if (!yaExiste) {
      arr.push({
        proveedorId: p.proveedorId,
        proveedorNombre: p.proveedor.nombre,
        precio: Number(p.precio),
        unidad: p.unidad,
        actualizado: p.createdAt.toISOString(),
      });
    }
    resultado.set(p.productoId, arr);
  }

  return resultado;
}

export async function getPreciosActualesFlat(
  productoIds: string[]
): Promise<PrecioActual[]> {
  if (!productoIds.length) return [];

  const preciosDb = await prisma.abastosProductoPrecio.findMany({
    where: {
      productoId: { in: productoIds },
      verificado: true,
      proveedor: { activo: true },
    },
    select: {
      productoId: true,
      proveedorId: true,
      precio: true,
      producto: { select: { nombre: true, unidad: true } },
      proveedor: { select: { nombre: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const vistos = new Set<string>();
  const resultado: PrecioActual[] = [];

  for (const p of preciosDb) {
    const key = `${p.productoId}_${p.proveedorId}`;
    if (vistos.has(key)) continue;
    vistos.add(key);

    resultado.push({
      productoId: p.productoId,
      proveedorId: p.proveedorId,
      precio: Number(p.precio),
      productoNombre: p.producto.nombre,
      productoUnidad: p.producto.unidad,
      proveedorNombre: p.proveedor.nombre,
    });
  }

  return resultado;
}
