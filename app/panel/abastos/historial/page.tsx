"use client";

import { useState, useCallback, useRef, useEffect } from "react";

type HistorialItem = {
  id: string;
  proveedor: string;
  precio: number;
  unidad: string;
  reportadoPor: string;
  fecha: string;
};

export default function HistorialPage() {
  const [q, setQ] = useState("");
  const [sugerencias, setSugerencias] = useState<{ id: string; nombre: string }[]>([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState<{ id: string; nombre: string } | null>(null);
  const [historial, setHistorial] = useState<HistorialItem[]>([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const inputRef = useRef<HTMLInputElement>(null);

  const buscarProductos = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSugerencias([]);
      return;
    }
    try {
      const res = await fetch(`/api/abastos/productos?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setSugerencias(data.productos ?? []);
    } catch {
      setSugerencias([]);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => buscarProductos(q), 200);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [q, buscarProductos]);

  async function seleccionarProducto(id: string, nombre: string) {
    setProductoSeleccionado({ id, nombre });
    setQ(nombre);
    setSugerencias([]);
    setCargando(true);
    setError("");
    try {
      const res = await fetch(`/api/abastos/historial?productoId=${encodeURIComponent(id)}`);
      if (!res.ok) throw new Error("Error al cargar historial");
      const data = await res.json();
      setHistorial(data.historial ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error de conexión");
    } finally {
      setCargando(false);
    }
  }

  return (
    <div>
      <div className="bg-white rounded-2xl p-5 shadow-sm mb-6">
        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
          Seleccionar insumo
        </label>
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            placeholder="Buscar insumo..."
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setProductoSeleccionado(null);
            }}
            onFocus={() => { if (q.trim()) buscarProductos(q); }}
            className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-300"
          />
          {sugerencias.length > 0 && !productoSeleccionado && (
            <div className="absolute z-10 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
              {sugerencias.map((s) => (
                <button
                  key={s.id}
                  onClick={() => seleccionarProducto(s.id, s.nombre)}
                  className="w-full text-left px-4 py-2.5 text-sm font-bold text-midnight hover:bg-gray-50 transition-colors"
                >
                  {s.nombre}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {cargando && (
        <div className="text-center py-12 text-sm text-gray-400">Cargando historial...</div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-center">
          <p className="text-sm font-bold text-red-700">{error}</p>
        </div>
      )}

      {!cargando && productoSeleccionado && !historial.length && !error && (
        <div className="text-center py-12 text-sm text-gray-400">
          No hay historial de precios para {productoSeleccionado.nombre}
        </div>
      )}

      {historial.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-midnight mb-4">
            Historial de {productoSeleccionado?.nombre}
          </h2>
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left p-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Fecha</th>
                    <th className="text-left p-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Proveedor</th>
                    <th className="text-right p-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Precio</th>
                    <th className="text-right p-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Reportado por</th>
                  </tr>
                </thead>
                <tbody>
                  {historial.map((h) => (
                    <tr key={h.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                      <td className="p-3 text-gray-500 whitespace-nowrap">
                        {new Date(h.fecha).toLocaleDateString("es-MX", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="p-3 font-bold text-midnight">{h.proveedor}</td>
                      <td className="p-3 text-right font-bold text-midnight whitespace-nowrap">
                        ${h.precio.toFixed(2)}
                        {h.unidad && (
                          <span className="text-[10px] font-normal text-gray-400 ml-1">/{h.unidad}</span>
                        )}
                      </td>
                      <td className="p-3 text-right text-gray-500 text-xs">{h.reportadoPor}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
