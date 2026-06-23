"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { obtenerLista, eliminarDeLista, actualizarCantidad, guardarLista } from "@/lib/abastos-storage";
import type { ItemListaStorage } from "@/lib/abastos-storage";

export default function ListaPage() {
  const router = useRouter();
  const [lista, setLista] = useState<ItemListaStorage[]>(obtenerLista);

  function manejarEliminar(productoId: string) {
    const nueva = eliminarDeLista(productoId);
    setLista(nueva);
  }

  function manejarCantidad(productoId: string, cantidad: number) {
    if (cantidad < 1) {
      manejarEliminar(productoId);
      return;
    }
    const nueva = actualizarCantidad(productoId, cantidad);
    setLista(nueva);
  }

  function limpiarLista() {
    guardarLista([]);
    setLista([]);
  }

  function irAComparar() {
    router.push("/panel/abastos/comparador");
  }

  if (!lista.length) {
    return (
      <div className="text-center py-16">
        <div className="bg-white rounded-2xl p-8 shadow-sm max-w-md mx-auto">
          <p className="text-lg font-bold text-midnight mb-2">Tu lista está vacía</p>
          <p className="text-sm text-gray-400 mb-6">
            Agrega insumos desde el buscador para comparar precios
          </p>
          <button
            onClick={() => router.push("/panel/abastos/buscar")}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-blue-700 transition-colors"
          >
            Ir al buscador
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-midnight">
          Tu lista ({lista.length} {lista.length === 1 ? "insumo" : "insumos"})
        </h2>
        <div className="flex gap-2">
          <button
            onClick={limpiarLista}
            className="text-xs font-bold bg-red-100 text-red-700 px-3 py-1.5 rounded-lg hover:bg-red-200 transition-colors"
          >
            Limpiar
          </button>
          <button
            onClick={irAComparar}
            className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors shadow-sm"
          >
            Comparar precios →
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left p-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Insumo</th>
                <th className="text-right p-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Cantidad</th>
                <th className="w-20"></th>
              </tr>
            </thead>
            <tbody>
              {lista.map((item) => (
                <tr key={item.productoId} className="border-b border-gray-50">
                  <td className="p-3 font-bold text-midnight">
                    {item.productoNombre}
                    <span className="font-normal text-gray-400 ml-1">/ {item.unidad}</span>
                  </td>
                  <td className="p-3 text-right">
                    <div className="inline-flex items-center gap-1 border border-gray-200 rounded-xl overflow-hidden">
                      <button
                        onClick={() => manejarCantidad(item.productoId, item.cantidad - 1)}
                        className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100 font-bold"
                      >
                        −
                      </button>
                      <span className="w-10 text-center font-bold text-midnight text-sm">
                        {item.cantidad}
                      </span>
                      <button
                        onClick={() => manejarCantidad(item.productoId, item.cantidad + 1)}
                        className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100 font-bold"
                      >
                        +
                      </button>
                    </div>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => manejarEliminar(item.productoId)}
                      className="text-xs font-bold text-red-500 hover:text-red-700 px-2 py-1"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
