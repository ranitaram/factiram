"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// Lee la respuesta de forma segura: comprueba res.ok antes de parsear
// y maneja respuestas no-JSON (HTML de error, vacío, etc.) sin romper la UI.
async function leerJsonSeguro<T = Record<string, unknown>>(
  res: Response
): Promise<{ ok: boolean; data: T | null; error: string | null }> {
  let data: T | null = null;
  let error: string | null = null;
  try {
    const txt = await res.text();
    if (txt) data = JSON.parse(txt) as T;
  } catch {
    error = "Respuesta del servidor no es JSON válido";
  }
  if (!res.ok) {
    const msgFromBody =
      data && typeof data === "object" && "error" in (data as Record<string, unknown>)
        ? String((data as Record<string, unknown>).error)
        : null;
    error = msgFromBody || error || `Error ${res.status}`;
  }
  return { ok: res.ok, data, error };
}

type Negocio = {
  id: string;
  nombre: string;
  slug: string;
  activo: boolean;
  semaforo: "VERDE" | "AMARILLO" | "ROJO";
  mensaje: string;
  setupPagado: boolean;
  proximoPagoAt: string | null;
  linkDueno: string;
  linkCajero: string;
  claveDueno: string | null;
  claveCajero: string | null;
};

const semaforoColor = {
  VERDE: "bg-green-500",
  AMARILLO: "bg-yellow-400",
  ROJO: "bg-red-500",
};

export default function AdminPanel() {
  const [negocios, setNegocios] = useState<Negocio[]>([]);
  const [cargando, setCargando] = useState(true);
  const [crearAbierto, setCrearAbierto] = useState(false);
  const [nombre, setNombre] = useState("");
  const [slug, setSlug] = useState("");
  const [creando, setCreando] = useState(false);
  const [errorCrear, setErrorCrear] = useState<string | null>(null);
  const [recienCreado, setRecienCreado] = useState<Negocio | null>(null);
  // Guard inmediato — `setCreando(true)` no se aplica antes del próximo render,
  // así que un ref evita que un doble-click dispare dos POST en la misma tick.
  const enviandoRef = useRef(false);

  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      const res = await fetch("/api/admin/negocios", { cache: "no-store" });
      const { ok, data, error } = await leerJsonSeguro<{ negocios: Negocio[] }>(res);
      if (!ok || !data) {
        console.error("Error al listar negocios:", error);
        setNegocios([]);
        return;
      }
      setNegocios(data.negocios ?? []);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  async function logout() {
    await fetch("/api/admin/auth", { method: "DELETE" });
    location.reload();
  }

  async function crear(e: React.FormEvent) {
    e.preventDefault();
    if (enviandoRef.current) return;
    enviandoRef.current = true;
    setCreando(true);
    setErrorCrear(null);
    try {
      const res = await fetch("/api/admin/negocios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombreNegocio: nombre, slugUrl: slug }),
      });
      const { ok, data, error } = await leerJsonSeguro<{
        negocioId: string;
        nombre: string;
        slug: string;
        linkDueno: string;
        linkCajero: string;
        claveDueno: string;
        claveCajero: string;
      }>(res);
      if (!ok || !data) {
        setErrorCrear(error || "Error al crear");
        return;
      }
      setRecienCreado({
        id: data.negocioId,
        nombre: data.nombre,
        slug: data.slug,
        activo: true,
        semaforo: "AMARILLO",
        mensaje: "Trial — 7 día(s) restante(s)",
        setupPagado: false,
        proximoPagoAt: null,
        linkDueno: data.linkDueno,
        linkCajero: data.linkCajero,
        claveDueno: data.claveDueno,
        claveCajero: data.claveCajero,
      });
      setNombre("");
      setSlug("");
      setCrearAbierto(false);
      await cargar();
    } catch {
      setErrorCrear("Error de conexión");
    } finally {
      setCreando(false);
      enviandoRef.current = false;
    }
  }

  async function ejecutar(id: string, accion: "activar" | "bloquear" | "reactivar") {
    const labels = {
      activar: "¿Activar mensualidad por 30 días?",
      bloquear: "¿Bloquear acceso a este negocio?",
      reactivar: "¿Reactivar acceso a este negocio?",
    };
    if (!confirm(labels[accion])) return;
    try {
      const res = await fetch(`/api/admin/negocios/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accion }),
      });
      const { ok, error } = await leerJsonSeguro(res);
      if (!ok) {
        alert(error || "Error al ejecutar la acción");
        return;
      }
      await cargar();
    } catch {
      alert("Error de conexión");
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 max-w-3xl mx-auto pb-12">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-blue-600">FACTIRAM Admin</h1>
          <p className="text-gray-500 text-sm">Gestión de negocios</p>
        </div>
        <button
          onClick={logout}
          className="text-gray-500 text-sm font-bold hover:text-red-500"
        >
          Salir
        </button>
      </div>

      {recienCreado && (
        <div className="bg-green-50 border-2 border-green-300 rounded-2xl p-5 mb-6">
          <p className="text-green-800 font-black text-lg mb-3">
            ✓ Negocio creado: {recienCreado.nombre}
          </p>
          <div className="space-y-2 text-sm">
            <CredencialRow label="Link cajero" value={origin() + recienCreado.linkCajero} />
            <CredencialRow label="Clave cajero" value={recienCreado.claveCajero ?? "—"} />
            <CredencialRow label="Link dueño" value={origin() + recienCreado.linkDueno} />
            <CredencialRow label="Clave dueño" value={recienCreado.claveDueno ?? "—"} />
          </div>
          <button
            onClick={() => setRecienCreado(null)}
            className="mt-4 text-xs font-bold text-green-700 underline"
          >
            Cerrar
          </button>
        </div>
      )}

      <button
        onClick={() => setCrearAbierto((v) => !v)}
        className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold mb-4 active:bg-blue-700"
      >
        {crearAbierto ? "Cancelar" : "+ Crear nuevo negocio"}
      </button>

      {crearAbierto && (
        <form onSubmit={crear} className="bg-white rounded-2xl p-5 shadow-sm mb-6 space-y-3">
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
              Nombre del negocio
            </label>
            <input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
              className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-300"
              placeholder="Tienda La Esquina"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
              Slug (URL)
            </label>
            <input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              required
              className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-300"
              placeholder="tienda-la-esquina"
            />
          </div>
          {errorCrear && <p className="text-red-500 text-sm">{errorCrear}</p>}
          <button
            type="submit"
            disabled={creando}
            className="w-full bg-green-600 text-white py-3 rounded-xl font-bold disabled:opacity-50"
          >
            {creando ? "Creando…" : "Crear con onboarding completo"}
          </button>
        </form>
      )}

      {cargando ? (
        <p className="text-center text-gray-500 py-8">Cargando…</p>
      ) : negocios.length === 0 ? (
        <p className="text-center text-gray-500 py-8">No hay negocios todavía.</p>
      ) : (
        <div className="space-y-3">
          {negocios.map((n) => (
            <div key={n.id} className="bg-white rounded-2xl p-5 shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`w-2.5 h-2.5 rounded-full ${semaforoColor[n.semaforo]}`} />
                    <h2 className="font-black text-gray-800">{n.nombre}</h2>
                    {!n.activo && (
                      <span className="text-[10px] font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                        BLOQUEADO
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">{n.mensaje}</p>
                </div>
              </div>

              <div className="space-y-1.5 text-sm border-t border-gray-100 pt-3">
                <CredencialRow label="Link cajero" value={origin() + n.linkCajero} />
                <CredencialRow label="Clave cajero" value={n.claveCajero ?? "—"} />
                <CredencialRow label="Link dueño" value={origin() + n.linkDueno} />
                <CredencialRow label="Clave dueño" value={n.claveDueno ?? "—"} />
              </div>

              <div className="flex flex-wrap gap-2 mt-4">
                <button
                  onClick={() => ejecutar(n.id, "activar")}
                  className="text-xs font-bold bg-green-100 text-green-700 px-3 py-1.5 rounded-lg hover:bg-green-200"
                >
                  Activar mensualidad
                </button>
                {n.activo ? (
                  <button
                    onClick={() => ejecutar(n.id, "bloquear")}
                    className="text-xs font-bold bg-red-100 text-red-700 px-3 py-1.5 rounded-lg hover:bg-red-200"
                  >
                    Bloquear
                  </button>
                ) : (
                  <button
                    onClick={() => ejecutar(n.id, "reactivar")}
                    className="text-xs font-bold bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-200"
                  >
                    Reactivar
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function origin(): string {
  if (typeof window === "undefined") return "";
  return window.location.origin;
}

function CredencialRow({ label, value }: { label: string; value: string }) {
  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      /* ignore */
    }
  }
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest shrink-0">
        {label}
      </span>
      <code className="flex-1 text-xs text-gray-700 truncate text-right">{value}</code>
      <button
        onClick={copy}
        className="text-[10px] font-bold text-blue-600 hover:underline shrink-0"
      >
        copiar
      </button>
    </div>
  );
}
