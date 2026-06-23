"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";

type Sugerencia = { id: string; nombre: string; unidad: string };
type Proveedor = { id: string; nombre: string };

export default function ReportarPage() {
  const router = useRouter();
  const [sesionOk, setSesionOk] = useState<boolean | null>(null);
  const [q, setQ] = useState("");
  const [sugerencias, setSugerencias] = useState<Sugerencia[]>([]);
  const [producto, setProducto] = useState<Sugerencia | null>(null);
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [proveedorId, setProveedorId] = useState("");
  const [precio, setPrecio] = useState("");
  const [unidad, setUnidad] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [estado, setEstado] = useState<"idle" | "ok" | "error">("idle");
  const [mensaje, setMensaje] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    fetch("/api/abastos/reportar", { method: "HEAD" })
      .then((r) => setSesionOk(r.ok))
      .catch(() => setSesionOk(false));
  }, []);

  useEffect(() => {
    fetch("/api/abastos/proveedores")
      .then((r) => r.json())
      .then((data) => setProveedores(data.proveedores ?? []))
      .catch(() => {});
  }, []);

  const buscarProductos = useCallback(async (query: string) => {
    if (!query.trim()) { setSugerencias([]); return; }
    try {
      const res = await fetch(`/api/abastos/productos?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setSugerencias(data.productos ?? []);
    } catch { setSugerencias([]); }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => buscarProductos(q), 200);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [q, buscarProductos]);

  useEffect(() => {
    if (producto) setUnidad(producto.unidad);
  }, [producto]);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    if (!producto || !proveedorId || !precio || !unidad) return;
    setEnviando(true);
    setEstado("idle");
    try {
      const res = await fetch("/api/abastos/reportar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productoId: producto.id,
          proveedorId,
          precio: parseFloat(precio),
          unidad,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Error al reportar");
      }
      setEstado("ok");
      setMensaje("Precio reportado correctamente. Un administrador lo revisará pronto.");
      setPrecio("");
      setProveedorId("");
      setProducto(null);
      setQ("");
    } catch (e) {
      setEstado("error");
      setMensaje(e instanceof Error ? e.message : "Error de conexión");
    } finally {
      setEnviando(false);
    }
  }

  if (sesionOk === null) {
    return <div className="text-center py-16 text-sm text-gray-400">Verificando sesión...</div>;
  }

  if (sesionOk === false) {
    return (
      <div className="text-center py-16">
        <div className="bg-white rounded-2xl p-8 shadow-sm max-w-md mx-auto">
          <p className="text-lg font-bold text-midnight mb-2">Acceso restringido</p>
          <p className="text-sm text-gray-400 mb-6">
            Debes iniciar sesión en FACTIRAM para reportar precios
          </p>
          <button
            onClick={() => router.push("/")}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-blue-700 transition-colors"
          >
            Ir al inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h2 className="text-lg font-bold text-midnight mb-6">Reportar precio</h2>

        <form onSubmit={enviar} className="space-y-5">
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
              Insumo
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar insumo..."
                value={q}
                onChange={(e) => { setQ(e.target.value); setProducto(null); }}
                onFocus={() => { if (q.trim()) buscarProductos(q); }}
                className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-300"
              />
              {sugerencias.length > 0 && !producto && (
                <div className="absolute z-10 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                  {sugerencias.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => { setProducto(s); setQ(s.nombre); setSugerencias([]); }}
                      className="w-full text-left px-4 py-2.5 text-sm font-bold text-midnight hover:bg-gray-50 transition-colors"
                    >
                      {s.nombre}
                      <span className="font-normal text-gray-400 ml-1">/ {s.unidad}</span>
                    </button>
                  ))}
                </div>
              )}
              {producto && (
                <div className="mt-2 inline-flex items-center gap-1 bg-blue-100 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-lg">
                  {producto.nombre} / {producto.unidad}
                  <button type="button" onClick={() => { setProducto(null); setQ(""); }} className="ml-1 hover:text-blue-900">✕</button>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
              Proveedor
            </label>
            <select
              value={proveedorId}
              onChange={(e) => setProveedorId(e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-300 bg-white"
            >
              <option value="">Seleccionar proveedor...</option>
              {proveedores.map((p) => (
                <option key={p.id} value={p.id}>{p.nombre}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
              Precio ($)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={precio}
              onChange={(e) => setPrecio(e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-300"
              disabled={!producto || !proveedorId}
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
              Unidad
            </label>
            <input
              type="text"
              placeholder={producto?.unidad || "kg, pieza, docena..."}
              value={unidad}
              onChange={(e) => setUnidad(e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-300"
            />
            <p className="text-[10px] text-gray-400 mt-1">
              Unidad por defecto: <strong>{producto?.unidad || "—"}</strong>. Cámbiala si el proveedor vende en otra presentación.
            </p>
          </div>

          <button
            type="submit"
            disabled={enviando || !producto || !proveedorId || !precio || !unidad}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold disabled:opacity-50 hover:bg-blue-700 transition-colors shadow-sm"
          >
            {enviando ? "Enviando..." : "Reportar precio"}
          </button>
        </form>

        {estado === "ok" && (
          <div className="mt-4 bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
            <p className="text-sm font-bold text-emerald-700">{mensaje}</p>
          </div>
        )}
        {estado === "error" && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-4 text-center">
            <p className="text-sm font-bold text-red-700">{mensaje}</p>
          </div>
        )}
      </div>
    </div>
  );
}
