export type ItemLista = {
  productoId: string;
  cantidad: number;
};

export type PrecioActual = {
  productoId: string;
  proveedorId: string;
  precio: number;
  productoNombre: string;
  productoUnidad: string;
  proveedorNombre: string;
};

export type DetalleProducto = {
  productoId: string;
  productoNombre: string;
  productoUnidad: string;
  cantidad: number;
  precio: number;
  subtotal: number;
};

export type TotalProveedor = {
  proveedorId: string;
  proveedorNombre: string;
  total: number;
  productos: DetalleProducto[];
};

export type ItemRutaOptima = {
  productoId: string;
  productoNombre: string;
  productoUnidad: string;
  cantidad: number;
  proveedorId: string;
  proveedorNombre: string;
  precio: number;
  subtotal: number;
};

export type ResultadoComparacion = {
  totalesProveedores: TotalProveedor[];
  mejorProveedorUnico: TotalProveedor | null;
  rutaOptima: {
    items: ItemRutaOptima[];
    total: number;
  } | null;
  ahorroRutaOptima: number;
  listaSinPrecio: { productoId: string; productoNombre: string }[];
};

export function calcularComparacion(
  lista: ItemLista[],
  precios: PrecioActual[]
): ResultadoComparacion {
  if (!lista.length || !precios.length) {
    return {
      totalesProveedores: [],
      mejorProveedorUnico: null,
      rutaOptima: null,
      ahorroRutaOptima: 0,
      listaSinPrecio: [],
    };
  }

  const precioPorProducto = new Map<string, PrecioActual[]>();
  for (const p of precios) {
    const arr = precioPorProducto.get(p.productoId) ?? [];
    arr.push(p);
    precioPorProducto.set(p.productoId, arr);
  }

  const listaSinPrecio: ResultadoComparacion["listaSinPrecio"] = [];
  const listaConPrecio: (ItemLista & { nombre: string; unidad: string })[] = [];

  for (const item of lista) {
    const preciosProd = precioPorProducto.get(item.productoId);
    if (!preciosProd || preciosProd.length === 0) {
      listaSinPrecio.push({
        productoId: item.productoId,
        productoNombre: precios.find((p) => p.productoId === item.productoId)?.productoNombre ?? "Desconocido",
      });
    } else {
      listaConPrecio.push({
        ...item,
        nombre: preciosProd[0].productoNombre,
        unidad: preciosProd[0].productoUnidad,
      });
    }
  }

  const proveedores = new Map<string, string>();
  for (const p of precios) {
    if (!proveedores.has(p.proveedorId)) {
      proveedores.set(p.proveedorId, p.proveedorNombre);
    }
  }

  const totalesProveedores: TotalProveedor[] = [];
  for (const [provId, provNombre] of proveedores) {
    const productos: DetalleProducto[] = [];
    let total = 0;
    for (const item of listaConPrecio) {
      const preciosProd = precioPorProducto.get(item.productoId) ?? [];
      const precioEnProv = preciosProd.find((p) => p.proveedorId === provId);
      if (!precioEnProv) continue;
      const subtotal = precioEnProv.precio * item.cantidad;
      total += subtotal;
      productos.push({
        productoId: item.productoId,
        productoNombre: item.nombre,
        productoUnidad: item.unidad,
        cantidad: item.cantidad,
        precio: precioEnProv.precio,
        subtotal,
      });
    }
    totalesProveedores.push({
      proveedorId: provId,
      proveedorNombre: provNombre,
      total: Math.round(total * 100) / 100,
      productos,
    });
  }

  const mejorProveedorUnico = totalesProveedores.length
    ? totalesProveedores.reduce((a, b) => (a.total < b.total ? a : b))
    : null;

  const itemsRutaOptima: ItemRutaOptima[] = [];
  let totalRutaOptima = 0;
  for (const item of listaConPrecio) {
    const preciosProd = precioPorProducto.get(item.productoId) ?? [];
    if (!preciosProd.length) continue;
    const mejor = preciosProd.reduce((a, b) => (a.precio < b.precio ? a : b));
    const subtotal = mejor.precio * item.cantidad;
    totalRutaOptima += subtotal;
    itemsRutaOptima.push({
      productoId: item.productoId,
      productoNombre: item.nombre,
      productoUnidad: item.unidad,
      cantidad: item.cantidad,
      proveedorId: mejor.proveedorId,
      proveedorNombre: mejor.proveedorNombre,
      precio: mejor.precio,
      subtotal: Math.round(subtotal * 100) / 100,
    });
  }

  const rutaOptima = itemsRutaOptima.length
    ? { items: itemsRutaOptima, total: Math.round(totalRutaOptima * 100) / 100 }
    : null;

  const ahorroRutaOptima = mejorProveedorUnico && rutaOptima
    ? Math.round((mejorProveedorUnico.total - rutaOptima.total) * 100) / 100
    : 0;

  return {
    totalesProveedores,
    mejorProveedorUnico,
    rutaOptima,
    ahorroRutaOptima,
    listaSinPrecio,
  };
}
