import prisma from "@/lib/prisma";
import type { PrecioActual } from "@/lib/abastos-engine";

export type ProductoDesactualizado = {
  id: string;
  nombre: string;
  unidad: string;
  categoria: string;
  ultimoPrecio: string | null;
  ultimoProveedor: string | null;
  diasDesdeActualizacion: number | null;
  sinPrecio: boolean;
  proveedoresConPrecio: number;
};

export async function getProductosDesactualizados(
  umbralDias = 14
): Promise<ProductoDesactualizado[]> {
  const productos = await prisma.abastosProducto.findMany({
    where: { activo: true },
    select: {
      id: true,
      nombre: true,
      unidad: true,
      categoria: true,
      precios: {
        where: { verificado: true, proveedor: { activo: true } },
        orderBy: { createdAt: "desc" },
        take: 1,
        select: {
          createdAt: true,
          proveedor: { select: { nombre: true } },
        },
      },
      _count: {
        select: {
          precios: {
            where: { verificado: true, proveedor: { activo: true } },
          },
        },
      },
    },
  });

  const ahora = Date.now();
  const umbralMs = umbralDias * 24 * 60 * 60 * 1000;

  return productos
    .filter((p) => {
      if (p.precios.length === 0) return true;
      const ultimo = p.precios[0].createdAt.getTime();
      return ahora - ultimo > umbralMs;
    })
    .map((p) => ({
      id: p.id,
      nombre: p.nombre,
      unidad: p.unidad,
      categoria: p.categoria,
      ultimoPrecio: p.precios[0]?.createdAt.toISOString() ?? null,
      ultimoProveedor: p.precios[0]?.proveedor.nombre ?? null,
      diasDesdeActualizacion: p.precios[0]
        ? Math.floor((ahora - p.precios[0].createdAt.getTime()) / (1000 * 60 * 60 * 24))
        : null,
      sinPrecio: p.precios.length === 0,
      proveedoresConPrecio: p._count.precios,
    }))
    .sort((a, b) => (a.diasDesdeActualizacion ?? 999) - (b.diasDesdeActualizacion ?? 999));
}

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
