"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { agregarALista, type ItemListaStorage } from "@/lib/abastos-storage";
import { useRouter } from "next/navigation";
import { getVisitorId, getSessionId } from "@/lib/abastos-visitor";

type PrecioProveedor = {
  proveedorId: string;
  proveedorNombre: string;
  precio: number;
  unidad: string;
  actualizado: string;
};

type ResultadoBusqueda = {
  productoId: string;
  slug: string;
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
  const [scrollAlFinal, setScrollAlFinal] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const scrollRef = useRef<HTMLDivElement>(null);
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
    const params = new URLSearchParams(window.location.search);
    const query = params.get("q");
    if (query) {
      setQ(query);
      buscar(query);
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
          body: JSON.stringify({
            tipo: "busqueda",
            metadata: { query: q, resultados: resultados.length },
            visitorId: getVisitorId(),
            sessionId: getSessionId(),
          }),
        }).catch(() => {});
      }, 1000);
    }
    return () => { if (trackRef.current) clearTimeout(trackRef.current); };
  }, [q, resultados]);

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
      body: JSON.stringify({
        tipo: "agregar_lista",
        metadata: { productoId: r.productoId, productoNombre: r.productoNombre },
        visitorId: getVisitorId(),
        sessionId: getSessionId(),
      }),
    });
  }

  function formatearFecha(): string {
    return new Date().toLocaleDateString("es-MX", { day: "numeric", month: "long" });
  }

  function formatearHora(): string {
    const h = new Date().getHours();
    const ampm = h >= 12 ? "pm" : "am";
    const hora12 = h % 12 || 12;
    return `${hora12} ${ampm}`;
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
        <p className="text-[11px] text-gray-500 leading-relaxed mb-3">
          Los precios mostrados se recopilan de información pública y pueden cambiar sin previo aviso. FACTIRAM procura mantener esta información actualizada periódicamente; sin embargo, los precios finales siempre serán los establecidos por cada proveedor al momento de la compra.
        </p>
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
          <div className="px-3 pt-3 pb-0">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Precios actualizados al {formatearFecha()} a las {formatearHora()}
            </p>
            <p className="md:hidden text-[10px] text-gray-300 italic animate-pulse pb-1">
              ← Desliza para ver precios
            </p>
          </div>
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
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left p-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Insumo</th>
                    {proveedores.map((nom) => (
                      <th key={nom} className="text-right p-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">
                        {nom}
                      </th>
                    ))}
                    <th className="sticky right-0 bg-gray-50 w-20 z-10 shadow-[-4px_0_6px_-4px_rgba(0,0,0,0.1)]"></th>
                  </tr>
                </thead>
                <tbody>
                  {resultados.map((r) => (
                    <tr key={r.productoId} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="p-3 font-bold text-midnight whitespace-nowrap">
                        <Link href={`/precios/${r.slug}`} className="hover:text-emerald-700 transition-colors">
                          {r.productoNombre}
                        </Link>
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
                      <td className="sticky right-0 bg-white p-3 text-right z-10 shadow-[-4px_0_6px_-4px_rgba(0,0,0,0.1)]">
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
            {!scrollAlFinal && (
              <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-white via-white/80 to-transparent" />
            )}
          </div>

          {agregado.size > 0 && (
            <div className="p-3 border-t border-gray-100 text-center">
              <button
                onClick={() => router.push("/panel/abastos/lista")}
                className="w-full max-w-xs py-3 rounded-xl font-bold bg-emerald-500 text-white hover:bg-emerald-600 transition-colors text-sm shadow-sm"
              >
                Ver mi lista ({agregado.size} producto{agregado.size !== 1 ? "s" : ""})
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
