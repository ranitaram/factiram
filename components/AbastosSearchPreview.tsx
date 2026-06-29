"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Link from "next/link";
import { Search, ArrowRight, Store } from "lucide-react";

type PrecioProveedor = {
  proveedorId: string;
  proveedorNombre: string;
  precio: number;
  unidad: string;
};

type ResultadoBusqueda = {
  productoId: string;
  productoNombre: string;
  unidad: string;
  precios: PrecioProveedor[];
};

export default function AbastosSearchPreview() {
  const [q, setQ] = useState("");
  const [resultados, setResultados] = useState<ResultadoBusqueda[]>([]);
  const [cargando, setCargando] = useState(false);
  const [mostroResultados, setMostroResultados] = useState(false);
  const [scrollAlFinal, setScrollAlFinal] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const scrollRef = useRef<HTMLDivElement>(null);

  const buscar = useCallback(async (query: string) => {
    if (!query.trim()) {
      setResultados([]);
      setMostroResultados(false);
      return;
    }
    setCargando(true);
    try {
      const res = await fetch(`/api/abastos/buscar?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setResultados(data.resultados ?? []);
      setMostroResultados(true);
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

  const trackRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => {
    if (trackRef.current) clearTimeout(trackRef.current);
    if (q.trim().length >= 2 && resultados.length > 0) {
      trackRef.current = setTimeout(() => {
        fetch("/api/abastos/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tipo: "busqueda", metadata: { query: q, resultados: resultados.length } }),
        }).catch(() => {});
      }, 1000);
    }
    return () => { if (trackRef.current) clearTimeout(trackRef.current); };
  }, [q, resultados]);

  function formatearFecha(): string {
    return new Date().toLocaleDateString("es-MX", { day: "numeric", month: "long" });
  }

  function formatearHora(): string {
    const h = new Date().getHours();
    const ampm = h >= 12 ? "pm" : "am";
    const hora12 = h % 12 || 12;
    return `${hora12} ${ampm}`;
  }

  const proveedores = Array.from(
    new Set(resultados.flatMap((r) => r.precios.map((p) => p.proveedorNombre)))
  );

  return (
    <section className="max-w-5xl mx-auto px-6">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest border border-blue-100 mb-6">
          <Store className="w-3.5 h-3.5" />
          Abastos — Compara precios de insumos en Tepic
        </div>

        <h2 className="text-3xl font-black text-midnight uppercase tracking-tighter italic mb-3">
          ¿Cuánto cuesta en cada proveedor?
        </h2>

        <p className="text-slate-500 max-w-2xl mx-auto leading-relaxed">
          Busca cualquier insumo y compara precios al instante entre los proveedores locales disponibles.
          Sin registro, sin límites.
        </p>
      </div>

      <div className="bg-white border border-slate-100 rounded-4xl p-6 shadow-xl">
        <div className="relative max-w-xl mx-auto mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
          <input
            type="text"
            placeholder="Ej: Arroz, Aceite, Camarón, Huevo..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-2xl text-sm font-medium focus:outline-none focus:border-blue-300 transition-colors"
            autoFocus
          />
        </div>

        {cargando && (
          <div className="text-center py-8 text-sm text-gray-400">Buscando...</div>
        )}

        {!cargando && mostroResultados && !resultados.length && (
          <div className="text-center py-8 text-sm text-gray-400">
            No encontramos &ldquo;{q}&rdquo;. Prueba con otro término.
          </div>
        )}

        {resultados.length > 0 && (
          <div>
            <p className="px-1 pb-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Precios actualizados al {formatearFecha()} a las {formatearHora()}
            </p>
            <p className="md:hidden px-1 pb-2 text-[10px] text-gray-300 italic animate-pulse">
              ← Desliza para ver precios
            </p>
            <div className="relative">
              <div
                ref={scrollRef}
                onScroll={() => {
                  const el = scrollRef.current;
                  if (!el) return;
                  setScrollAlFinal(el.scrollLeft + el.clientWidth >= el.scrollWidth - 2);
                }}
                className="overflow-x-auto"
              >
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left pb-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Insumo</th>
                      {proveedores.map((nom) => (
                        <th key={nom} className="text-right pb-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">
                          {nom}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {resultados.map((r) => (
                      <tr key={r.productoId} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                        <td className="py-3 pr-4 font-bold text-midnight whitespace-nowrap">
                          {r.productoNombre}
                          <span className="font-normal text-gray-400 ml-1">/{r.unidad}</span>
                        </td>
                        {proveedores.map((nom) => {
                          const p = r.precios.find((pr) => pr.proveedorNombre === nom);
                          return (
                            <td key={nom} className="py-3 pl-4 text-right font-bold whitespace-nowrap">
                              {p ? (
                                <span className="text-midnight">
                                  ${p.precio.toFixed(2)}
                                </span>
                              ) : (
                                <span className="text-gray-300">—</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {!scrollAlFinal && (
                <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-white via-white/80 to-transparent" />
              )}
            </div>
          </div>
        )}

        {mostroResultados && (
          <div className="text-center mt-6 pt-4 border-t border-gray-100">
            <Link
              href={`/panel/abastos/buscar?q=${encodeURIComponent(q)}`}
              className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors"
            >
              Ver todos los precios <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>

      <div className="mt-4 text-center">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
          ¿Eres dueño de negocio? <Link href="/planes" className="text-emerald-pro underline">Activa FACTIRAM</Link> y reporta precios para todos.
        </p>
      </div>
    </section>
  );
}
