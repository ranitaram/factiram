export type ItemListaStorage = {
  productoId: string;
  productoNombre: string;
  unidad: string;
  cantidad: number;
};

const STORAGE_KEY = "factiram_abastos_lista";

export function obtenerLista(): ItemListaStorage[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as ItemListaStorage[];
  } catch {
    return [];
  }
}

export function guardarLista(lista: ItemListaStorage[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(lista));
}

export function agregarALista(item: ItemListaStorage): ItemListaStorage[] {
  const lista = obtenerLista();
  const idx = lista.findIndex((i) => i.productoId === item.productoId);
  if (idx >= 0) {
    lista[idx].cantidad += 1;
  } else {
    lista.push(item);
  }
  guardarLista(lista);
  return lista;
}

export function eliminarDeLista(productoId: string): ItemListaStorage[] {
  const lista = obtenerLista().filter((i) => i.productoId !== productoId);
  guardarLista(lista);
  return lista;
}

export function actualizarCantidad(productoId: string, cantidad: number): ItemListaStorage[] {
  const lista = obtenerLista();
  const idx = lista.findIndex((i) => i.productoId === productoId);
  if (idx >= 0 && cantidad > 0) {
    lista[idx].cantidad = cantidad;
  } else if (idx >= 0 && cantidad <= 0) {
    return eliminarDeLista(productoId);
  }
  guardarLista(lista);
  return lista;
}
