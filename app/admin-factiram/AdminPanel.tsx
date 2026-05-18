"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

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

type ListaResponse = {
  negocios: Negocio[];
  total: number;
  totalPages: number;
  page: number;
  limit: number;
};

const semaforoColor = {
  VERDE: "bg-green-500",
  AMARILLO: "bg-yellow-400",
  ROJO: "bg-red-500",
};

const PAGE_SIZE = 10;

export default function AdminPanel() {
  const [negocios, setNegocios] = useState<Negocio[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [cargando, setCargando] = useState(true);

  const [crearAbierto, setCrearAbierto] = useState(false);
  const [nombre, setNombre] = useState("");
  const [slug, setSlug] = useState("");
  const [creando, setCreando] = useState(false);
  const [errorCrear, setErrorCrear] = useState<string | null>(null);
  const [recienCreado, setRecienCreado] = useState<Negocio | null>(null);
  const enviandoRef = useRef(false);

  const [eliminarTarget, setEliminarTarget] = useState<Negocio | null>(null);
  const [eliminarTexto, setEliminarTexto] = useState("");
  const [eliminando, setEliminando] = useState(false);
  const [errorEliminar, setErrorEliminar] = useState<string | null>(null);

  // ── Debounce del buscador (~400ms) ─────────────────────
  // Evita disparar fetch en cada tecla. Cuando el usuario escribe, sólo
  // tras 400ms sin cambios se actualiza `search`, lo que dispara el fetch.
  // También resetea a la página 1 al cambiar la búsqueda.
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  // ── Fetch único: depende de `page` y `search` ─────────
  const cargar = useCallback(async (signal?: AbortSignal) => {
    setCargando(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(PAGE_SIZE),
      });
      if (search) params.set("search", search);
      const res = await fetch(`/api/admin/negocios?${params.toString()}`, {
        cache: "no-store",
        signal,
      });
      const { ok, data, error } = await leerJsonSeguro<ListaResponse>(res);
      if (!ok || !data) {
        console.error("Error al listar negocios:", error);
        setNegocios([]);
        setTotal(0);
        setTotalPages(1);
        return;
      }
      setNegocios(data.negocios ?? []);
      setTotal(data.total ?? 0);
      setTotalPages(data.totalPages ?? 1);
    } catch (e) {
      if ((e as { name?: string })?.name === "AbortError") return;
      console.error("Error de red al listar:", e);
    } finally {
      setCargando(false);
    }
  }, [page, search]);

  useEffect(() => {
    const ctl = new AbortController();
    cargar(ctl.signal);
    return () => ctl.abort();
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
      // Volver a la primera página y limpiar búsqueda para que aparezca arriba
      setSearchInput("");
      setSearch("");
      setPage(1);
      await cargar();
    } catch {
      setErrorCrear("Error de conexión");
    } finally {
      setCreando(false);
      enviandoRef.current = false;
    }
  }

  function abrirEliminar(n: Negocio) {
    setEliminarTarget(n);
    setEliminarTexto("");
    setErrorEliminar(null);
  }

  function cerrarEliminar() {
    if (eliminando) return;
    setEliminarTarget(null);
    setEliminarTexto("");
    setErrorEliminar(null);
  }

  async function confirmarEliminar() {
    if (!eliminarTarget || eliminando) return;
    if (eliminarTexto.trim() !== eliminarTarget.nombre) {
      setErrorEliminar("El nombre no coincide.");
      return;
    }
    setEliminando(true);
    setErrorEliminar(null);
    try {
      const res = await fetch(`/api/admin/negocios/${eliminarTarget.id}`, {
        method: "DELETE",
      });
      const { ok, error } = await leerJsonSeguro(res);
      if (!ok) {
        setErrorEliminar(error || "No se pudo eliminar");
        return;
      }
      // Actualizacion local: quitar el negocio sin refetch completo.
      const eliminadoId = eliminarTarget.id;
      const restantesEnPagina = negocios.length - 1;
      setNegocios((prev) => prev.filter((x) => x.id !== eliminadoId));
      setTotal((t) => Math.max(0, t - 1));
      const nuevoTotal = Math.max(0, total - 1);
      const nuevasPaginas = Math.max(1, Math.ceil(nuevoTotal / PAGE_SIZE));
      setTotalPages(nuevasPaginas);
      setEliminarTarget(null);
      setEliminarTexto("");
      // Si la pagina actual quedo vacia y no es la primera, retroceder.
      // En otros casos refetch ligero para rellenar con el siguiente registro.
      if (restantesEnPagina === 0 && page > 1) {
        setPage((p) => Math.min(nuevasPaginas, p - 1));
      } else {
        await cargar();
      }
    } catch {
      setErrorEliminar("Error de conexión");
    } finally {
      setEliminando(false);
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

  const baseUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    return window.location.origin;
  }, []);

  const desde = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const hasta = Math.min(page * PAGE_SIZE, total);

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
            <CredencialRow label="Link cajero" value={baseUrl + recienCreado.linkCajero} />
            <CredencialRow label="Clave cajero" value={recienCreado.claveCajero ?? "—"} />
            <CredencialRow label="Link dueño" value={baseUrl + recienCreado.linkDueno} />
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

      {/* BUSCADOR */}
      <div className="mb-4">
        <input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Buscar por nombre o slug…"
          className="w-full p-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:border-blue-300"
        />
        {search && (
          <p className="text-xs text-gray-400 mt-1">
            Buscando: <span className="font-bold">{search}</span>
            {" · "}
            <button
              onClick={() => setSearchInput("")}
              className="text-blue-600 hover:underline"
            >
              limpiar
            </button>
          </p>
        )}
      </div>

      {cargando ? (
        <p className="text-center text-gray-500 py-8">Cargando…</p>
      ) : negocios.length === 0 ? (
        <p className="text-center text-gray-500 py-8">
          {search ? `Sin resultados para "${search}".` : "No hay negocios todavía."}
        </p>
      ) : (
        <>
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
                  <CredencialRow label="Link cajero" value={baseUrl + n.linkCajero} />
                  <CredencialRow label="Clave cajero" value={n.claveCajero ?? "—"} />
                  <CredencialRow label="Link dueño" value={baseUrl + n.linkDueno} />
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
                  <button
                    onClick={() => abrirEliminar(n)}
                    className="text-xs font-bold bg-red-600 text-white px-3 py-1.5 rounded-lg hover:bg-red-700 ml-auto inline-flex items-center gap-1.5 shadow-sm"
                    title="Eliminar negocio permanentemente"
                  >
                    <span aria-hidden>🗑</span> Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* MODAL ELIMINAR */}
          {eliminarTarget && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
              onClick={cerrarEliminar}
            >
              <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 border-t-4 border-red-600"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-xl">
                    ⚠️
                  </div>
                  <h3 className="text-lg font-black text-gray-800">
                    Eliminar negocio
                  </h3>
                </div>

                <p className="text-sm text-gray-700 mb-3">
                  Vas a eliminar permanentemente{" "}
                  <span className="font-bold text-gray-900">
                    {eliminarTarget.nombre}
                  </span>
                  . Esta acción es{" "}
                  <span className="font-bold text-red-600">irreversible</span>.
                </p>

                <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 text-xs text-red-900 space-y-1">
                  <p className="font-bold">Se borrarán todos los datos:</p>
                  <ul className="list-disc list-inside space-y-0.5 text-red-800">
                    <li>Suscripción y accesos (dueño/cajero)</li>
                    <li>Productos, costos fijos y configuración</li>
                    <li>Ventas, fiados y cobros</li>
                    <li>Gastos y efectivo en caja</li>
                  </ul>
                </div>

                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                  Escribe el nombre para confirmar
                </label>
                <input
                  value={eliminarTexto}
                  onChange={(e) => {
                    setEliminarTexto(e.target.value);
                    if (errorEliminar) setErrorEliminar(null);
                  }}
                  placeholder={eliminarTarget.nombre}
                  autoFocus
                  disabled={eliminando}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:border-red-400 disabled:opacity-60"
                />

                {errorEliminar && (
                  <p className="text-red-500 text-sm mt-2">{errorEliminar}</p>
                )}

                <div className="flex gap-2 mt-5">
                  <button
                    onClick={cerrarEliminar}
                    disabled={eliminando}
                    className="flex-1 py-3 rounded-xl font-bold bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={confirmarEliminar}
                    disabled={
                      eliminando ||
                      eliminarTexto.trim() !== eliminarTarget.nombre
                    }
                    className="flex-1 py-3 rounded-xl font-bold bg-red-600 text-white hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {eliminando ? "Eliminando…" : "Eliminar definitivamente"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* PAGINACIÓN */}
          <div className="flex items-center justify-between mt-6 bg-white rounded-2xl p-3 shadow-sm">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-4 py-2 text-sm font-bold bg-gray-100 text-gray-700 rounded-lg disabled:opacity-40 hover:bg-gray-200"
            >
              ← Anterior
            </button>
            <div className="text-center">
              <p className="text-sm font-bold text-gray-700">
                Página {page} de {totalPages}
              </p>
              <p className="text-[10px] text-gray-400">
                {desde}–{hasta} de {total}
              </p>
            </div>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="px-4 py-2 text-sm font-bold bg-gray-100 text-gray-700 rounded-lg disabled:opacity-40 hover:bg-gray-200"
            >
              Siguiente →
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function CredencialRow({ label, value }: { label: string; value: string }) {
  const [copiado, setCopiado] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopiado(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setCopiado(false), 2000);
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
        className={`text-[10px] font-bold shrink-0 px-2 py-0.5 rounded transition-colors ${
          copiado
            ? "bg-green-100 text-green-700"
            : "text-blue-600 hover:underline"
        }`}
      >
        {copiado ? "✓ Copiado" : "Copiar"}
      </button>
    </div>
  );
}
