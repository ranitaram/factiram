"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { agregarALista, type ItemListaStorage } from "@/lib/abastos-storage";
import { useRouter } from "next/navigation";

type PrecioProveedor = {
  proveedorId: string;
  proveedorNombre: string;
  precio: number;
  unidad: string;
  actualizado: string;
};

type ResultadoBusqueda = {
  productoId: string;
  productoNombre: string;
  unidad: string;
  categoria: string;
  precios: PrecioProveedor[];
};

export default function BuscarPage() {
  const [q, setQ] = useState("");
  const [resultados, setResultados] = useState<ResultadoBusqueda[]>([]);
  const [cargando, setCargando] = useState(false);
  const [agregado, setAgregado] = useState<Set<string>>(new Set());
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const router = useRouter();

  const buscar = useCallback(async (query: string) => {
    if (!query.trim()) {
      setResultados([]);
      return;
    }
    setCargando(true);
    try {
      const res = await fetch(`/api/abastos/buscar?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setResultados(data.resultados ?? []);
    } catch {
      setResultados([]);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => buscar(q), 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [q, buscar]);

  function agregar(r: ResultadoBusqueda) {
    const item: ItemListaStorage = {
      productoId: r.productoId,
      productoNombre: r.productoNombre,
      unidad: r.unidad,
      cantidad: 1,
    };
    agregarALista(item);
    setAgregado((prev) => new Set(prev).add(r.productoId));
    fetch("/api/abastos/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tipo: "agregar_lista", metadata: { productoId: r.productoId, productoNombre: r.productoNombre } }),
    });
  }

  const proveedoresSet = new Set<string>();
  for (const r of resultados) {
    for (const p of r.precios) {
      proveedoresSet.add(p.proveedorNombre);
    }
  }
  const proveedores = Array.from(proveedoresSet);

  return (
    <div>
      <div className="bg-white rounded-2xl p-5 shadow-sm mb-6">
        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
          Buscar insumo
        </label>
        <input
          type="text"
          placeholder="Ej: Arroz, Aceite, Camarón..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-300"
          autoFocus
        />
      </div>

      {cargando && (
        <div className="text-center py-12 text-sm text-gray-400">Buscando...</div>
      )}

      {!cargando && q.trim() && !resultados.length && (
        <div className="text-center py-12 text-sm text-gray-400">
          No se encontraron resultados para &ldquo;{q}&rdquo;
        </div>
      )}

      {resultados.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left p-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Insumo</th>
                  {proveedores.map((nom) => (
                    <th key={nom} className="text-right p-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">
                      {nom}
                    </th>
                  ))}
                  <th className="w-20"></th>
                </tr>
              </thead>
              <tbody>
                {resultados.map((r) => (
                  <tr key={r.productoId} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="p-3 font-bold text-midnight whitespace-nowrap">
                      {r.productoNombre}
                      <span className="font-normal text-gray-400 ml-1">/ {r.unidad}</span>
                    </td>
                    {proveedores.map((nom) => {
                      const p = r.precios.find((pr) => pr.proveedorNombre === nom);
                      return (
                        <td key={nom} className="p-3 text-right font-bold whitespace-nowrap">
                          {p ? (
                            <span className="text-midnight">
                              ${p.precio.toFixed(2)}
                              {p.unidad !== r.unidad && (
                                <span className="text-[10px] font-normal text-gray-400 ml-1">/{p.unidad}</span>
                              )}
                            </span>
                          ) : (
                            <span className="text-gray-300">—</span>
                          )}
                        </td>
                      );
                    })}
                    <td className="p-3 text-right">
                      {agregado.has(r.productoId) ? (
                        <button
                          onClick={() => router.push("/panel/abastos/lista")}
                          className="text-xs font-bold bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-lg hover:bg-emerald-200 transition-colors"
                        >
                          ✓ En lista
                        </button>
                      ) : (
                        <button
                          onClick={() => agregar(r)}
                          className="text-xs font-bold bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-200 transition-colors"
                        >
                          + Agregar
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
