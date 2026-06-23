"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { obtenerLista } from "@/lib/abastos-storage";
import type { ItemListaStorage } from "@/lib/abastos-storage";

type DetalleProducto = {
  productoId: string;
  productoNombre: string;
  productoUnidad: string;
  cantidad: number;
  precio: number;
  subtotal: number;
};

type TotalProveedor = {
  proveedorId: string;
  proveedorNombre: string;
  total: number;
  productos: DetalleProducto[];
};

type ItemRutaOptima = {
  productoId: string;
  productoNombre: string;
  productoUnidad: string;
  cantidad: number;
  proveedorId: string;
  proveedorNombre: string;
  precio: number;
  subtotal: number;
};

type ResultadoComparacion = {
  totalesProveedores: TotalProveedor[];
  mejorProveedorUnico: TotalProveedor | null;
  rutaOptima: { items: ItemRutaOptima[]; total: number } | null;
  ahorroRutaOptima: number;
  listaSinPrecio: { productoId: string; productoNombre: string }[];
};

export default function ComparadorPage() {
  const router = useRouter();
  const [lista, setLista] = useState<ItemListaStorage[]>([]);
  const [resultado, setResultado] = useState<ResultadoComparacion | null>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const items = obtenerLista();
    if (!items.length) return;
    setLista(items);
    comparar(items);
  }, []);

  async function comparar(lista: ItemListaStorage[]) {
    setCargando(true);
    setError("");
    try {
      const res = await fetch("/api/abastos/comparar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lista }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Error al comparar");
      }
      const data = await res.json();
      setResultado(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error de conexión");
    } finally {
      setCargando(false);
    }
  }

  const cheapSet = useMemo(() => {
    if (!resultado?.rutaOptima) return new Set<string>();
    return new Set(resultado.rutaOptima.items.map((i) => `${i.productoId}_${i.proveedorId}`));
  }, [resultado?.rutaOptima]);

  if (!lista.length && !cargando) {
    return (
      <div className="text-center py-16">
        <div className="bg-white rounded-2xl p-8 shadow-sm max-w-md mx-auto">
          <p className="text-lg font-bold text-midnight mb-2">Sin lista para comparar</p>
          <p className="text-sm text-gray-400 mb-6">
            Agrega insumos a tu lista desde el buscador
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

  if (cargando) {
    return (
      <div className="text-center py-16">
        <div className="bg-white rounded-2xl p-8 shadow-sm max-w-md mx-auto">
          <p className="text-sm text-gray-400">Comparando precios...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 max-w-md mx-auto">
          <p className="font-bold text-red-700 mb-2">Error</p>
          <p className="text-sm text-red-600 mb-4">{error}</p>
          <button
            onClick={() => comparar(lista)}
            className="bg-red-600 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-red-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (!resultado) return null;

  return (
    <div className="space-y-6">
      {resultado.mejorProveedorUnico && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-1">
                Mejor proveedor único
              </p>
              <p className="text-xl font-black text-midnight">{resultado.mejorProveedorUnico.proveedorNombre}</p>
              <p className="text-sm text-gray-500 mt-1">
                Total: <span className="font-bold text-midnight">${resultado.mejorProveedorUnico.total.toFixed(2)}</span>
              </p>
            </div>
            {resultado.ahorroRutaOptima > 0 && (
              <div className="text-right bg-white rounded-xl px-4 py-3 shadow-sm">
                <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Ahorro posible</p>
                <p className="text-2xl font-black text-emerald-600">
                  ${resultado.ahorroRutaOptima.toFixed(2)}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {resultado.rutaOptima && resultado.totalesProveedores.length > 1 && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 shadow-sm">
          <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-3">
            Ruta óptima (comprar cada producto donde esté más barato)
          </p>
          <div className="space-y-2">
            {resultado.rutaOptima.items.map((item) => (
              <div key={item.productoId} className="flex items-center justify-between bg-white rounded-xl px-4 py-2.5 shadow-sm">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-midnight text-sm">{item.productoNombre}</span>
                  <span className="text-gray-400 text-xs">x{item.cantidad}</span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-gray-500 mr-2">en {item.proveedorNombre}</span>
                  <span className="font-bold text-midnight">${item.subtotal.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="text-right mt-4 pt-3 border-t border-blue-200">
            <span className="text-sm text-gray-500">Total ruta óptima: </span>
            <span className="text-lg font-black text-midnight">
              ${resultado.rutaOptima.total.toFixed(2)}
            </span>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <h3 className="text-sm font-bold text-midnight">Comparativa por proveedor</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left p-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Insumo</th>
                {resultado.totalesProveedores.map((p) => (
                  <th key={p.proveedorId} className="text-right p-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    {p.proveedorNombre}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {lista.map((item) => (
                <tr key={item.productoId} className="border-b border-gray-50">
                  <td className="p-3 font-bold text-midnight">
                    {item.productoNombre}
                    <span className="font-normal text-gray-400 ml-1">x{item.cantidad}</span>
                  </td>
                  {resultado.totalesProveedores.map((p) => {
                    const prod = p.productos.find((pr) => pr.productoId === item.productoId);
                    const esMasBarato = cheapSet.has(`${item.productoId}_${p.proveedorId}`);
                    return (
                      <td key={p.proveedorId} className="p-3 text-right font-bold whitespace-nowrap">
                        {prod ? (
                          <span className={esMasBarato ? "text-emerald-600" : "text-midnight"}>
                            ${prod.subtotal.toFixed(2)}
                            <span className="text-[10px] font-normal text-gray-400 ml-1">
                              (${prod.precio.toFixed(2)}/{item.unidad})
                            </span>
                          </span>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
              <tr className="bg-gray-50 border-t-2 border-gray-200">
                <td className="p-3 font-black text-midnight text-sm">Total</td>
                {resultado.totalesProveedores.map((p) => (
                  <td key={p.proveedorId} className="p-3 text-right font-black text-midnight">
                    ${p.total.toFixed(2)}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-center gap-3">
        <button
          onClick={() => router.push("/panel/abastos/lista")}
          className="flex-1 max-w-xs py-3 rounded-xl font-bold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors text-sm"
        >
          Editar lista
        </button>
        <button
          onClick={() => comparar(lista)}
          className="flex-1 max-w-xs py-3 rounded-xl font-bold bg-blue-600 text-white hover:bg-blue-700 transition-colors text-sm shadow-sm"
        >
          Actualizar
        </button>
      </div>
    </div>
  );
}
