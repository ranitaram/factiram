"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, Search, ShoppingCart, BarChart3, Users, MessageCircle } from "lucide-react";
import BuscadorProducto from "./BuscadorProducto";

type Proveedor = { id: string; nombre: string; direccion?: string | null; telefono?: string | null; activo: boolean };
type Producto = { id: string; nombre: string; unidad: string; categoria: string; activo: boolean };
type Reporte = {
  id: string;
  precio: number;
  unidad: string;
  createdAt: string;
  producto: { nombre: string; unidad: string };
  proveedor: { nombre: string };
  negocio: { nombre: string } | null;
};

type TabSeccion = "proveedores" | "productos" | "precios" | "reportes" | "metricas";

const TABS: { key: TabSeccion; label: string }[] = [
  { key: "proveedores", label: "Proveedores" },
  { key: "productos", label: "Productos" },
  { key: "precios", label: "Precios" },
  { key: "reportes", label: "Reportes" },
  { key: "metricas", label: "Métricas" },
];

export default function AdminAbastos() {
  const [tab, setTab] = useState<TabSeccion>("proveedores");

  return (
    <div>
      <div className="flex gap-1 mb-6 bg-gray-100 rounded-xl p-1">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-bold transition-colors ${
              tab === t.key
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tab === "proveedores" && <SeccionProveedores />}
      {tab === "productos" && <SeccionProductos />}
      {tab === "precios" && <SeccionPrecios />}
      {tab === "reportes" && <SeccionReportes />}
      {tab === "metricas" && <SeccionMetricas />}
    </div>
  );
}

function useFetchConAbort(fetchFn: (signal: AbortSignal) => Promise<void>, deps: unknown[]) {
  useEffect(() => {
    const ctl = new AbortController();
    fetchFn(ctl.signal);
    return () => ctl.abort();
  }, deps);
}

function SeccionProveedores() {
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [cargando, setCargando] = useState(true);
  const [nombre, setNombre] = useState("");
  const [direccion, setDireccion] = useState("");
  const [telefono, setTelefono] = useState("");
  const [creando, setCreando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [editNombre, setEditNombre] = useState("");
  const [editDireccion, setEditDireccion] = useState("");
  const [editTelefono, setEditTelefono] = useState("");
  const [guardando, setGuardando] = useState(false);

  const cargar = useCallback(async (signal?: AbortSignal) => {
    setCargando(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/abastos/proveedores", { signal });
      if (!res.ok) {
        setProveedores([]);
        return;
      }
      const data = await res.json();
      if (data && Array.isArray(data.proveedores)) {
        setProveedores(data.proveedores);
      } else {
        setProveedores([]);
      }
    } catch (e) {
      if ((e as { name?: string }).name === "AbortError") return;
      setProveedores([]);
      setError("Error de conexión");
    } finally {
      setCargando(false);
    }
  }, []);

  useFetchConAbort((signal) => cargar(signal), [cargar]);

  async function crear(e: React.FormEvent) {
    e.preventDefault();
    if (!nombre.trim() || creando) return;
    setCreando(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/abastos/proveedores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: nombre.trim(),
          direccion: direccion.trim() || undefined,
          telefono: telefono.trim() || undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data?.error || "Error al crear proveedor");
        return;
      }
      setNombre("");
      setDireccion("");
      setTelefono("");
      cargar();
    } catch {
      setError("Error de conexión");
    } finally {
      setCreando(false);
    }
  }

  async function toggleActivo(p: Proveedor) {
    setProveedores((prev) =>
      prev.map((x) => (x.id === p.id ? { ...x, activo: !x.activo } : x))
    );
    try {
      const res = await fetch(`/api/admin/abastos/proveedores/${p.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activo: !p.activo }),
      });
      if (!res.ok) {
        setProveedores((prev) =>
          prev.map((x) => (x.id === p.id ? { ...x, activo: p.activo } : x))
        );
      }
    } catch {
      setProveedores((prev) =>
        prev.map((x) => (x.id === p.id ? { ...x, activo: p.activo } : x))
      );
    }
  }

  function iniciarEdicion(p: Proveedor) {
    setEditandoId(p.id);
    setEditNombre(p.nombre);
    setEditDireccion(p.direccion || "");
    setEditTelefono(p.telefono || "");
  }

  function cancelarEdicion() {
    setEditandoId(null);
  }

  async function guardarEdicion(id: string) {
    if (!editNombre.trim() || guardando) return;
    setGuardando(true);
    try {
      const res = await fetch(`/api/admin/abastos/proveedores/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: editNombre.trim(),
          direccion: editDireccion.trim() || "",
          telefono: editTelefono.trim() || "",
        }),
      });
      if (res.ok) {
        setEditandoId(null);
        cargar();
      }
    } catch {
      // silent
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div>
      <form onSubmit={crear} className="bg-white rounded-2xl p-5 shadow-sm mb-4 space-y-3">
        <h3 className="font-black text-gray-800">Agregar proveedor</h3>
        <input
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Nombre del proveedor *"
          required
          className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-300"
        />
        <input
          value={direccion}
          onChange={(e) => setDireccion(e.target.value)}
          placeholder="Dirección (opcional)"
          className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-300"
        />
        <input
          value={telefono}
          onChange={(e) => setTelefono(e.target.value)}
          placeholder="Teléfono (opcional)"
          className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-300"
        />
        <button
          type="submit"
          disabled={creando}
          className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold disabled:opacity-50"
        >
          {creando ? "Agregando…" : "+ Agregar proveedor"}
        </button>
        {error && <p className="text-red-500 text-xs">{error}</p>}
      </form>

      {cargando ? (
        <p className="text-center text-gray-500 py-8">Cargando…</p>
      ) : proveedores.length === 0 ? (
        <p className="text-center text-gray-500 py-4">Sin proveedores</p>
      ) : (
        <div className="space-y-2">
          {proveedores.map((p) => (
            <div key={p.id} className="bg-white rounded-xl p-4 shadow-sm">
              {editandoId === p.id ? (
                <div className="space-y-3">
                  <input
                    value={editNombre}
                    onChange={(e) => setEditNombre(e.target.value)}
                    placeholder="Nombre"
                    className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-300"
                  />
                  <input
                    value={editDireccion}
                    onChange={(e) => setEditDireccion(e.target.value)}
                    placeholder="Dirección"
                    className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-300"
                  />
                  <input
                    value={editTelefono}
                    onChange={(e) => setEditTelefono(e.target.value)}
                    placeholder="Teléfono"
                    className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-300"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => guardarEdicion(p.id)}
                      disabled={guardando}
                      className="flex-1 bg-blue-600 text-white py-2 rounded-xl font-bold text-sm disabled:opacity-50"
                    >
                      {guardando ? "Guardando…" : "Guardar"}
                    </button>
                    <button
                      onClick={cancelarEdicion}
                      className="px-4 py-2 rounded-xl font-bold text-sm bg-gray-100 text-gray-600 hover:bg-gray-200"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`font-bold ${p.activo ? "text-gray-800" : "text-gray-400"}`}>
                        {p.nombre}
                      </span>
                      {!p.activo && (
                        <span className="text-[10px] font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                          INACTIVO
                        </span>
                      )}
                    </div>
                    {(p.direccion || p.telefono) && (
                      <div className="text-xs text-gray-500 mt-1 space-y-0.5">
                        {p.direccion && <p>📍 {p.direccion}</p>}
                        {p.telefono && <p>📞 {p.telefono}</p>}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => iniciarEdicion(p)}
                      className="text-xs font-bold px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => toggleActivo(p)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-lg ${
                        p.activo
                          ? "bg-red-100 text-red-700 hover:bg-red-200"
                          : "bg-green-100 text-green-700 hover:bg-green-200"
                      }`}
                    >
                      {p.activo ? "Desactivar" : "Activar"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SeccionProductos() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [cargando, setCargando] = useState(true);
  const [nombre, setNombre] = useState("");
  const [unidad, setUnidad] = useState("kg");
  const [categoria, setCategoria] = useState("Basicos");
  const [proveedorId, setProveedorId] = useState("");
  const [precioInicial, setPrecioInicial] = useState("");
  const [creando, setCreando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [editNombre, setEditNombre] = useState("");
  const [editUnidad, setEditUnidad] = useState("kg");
  const [editCategoria, setEditCategoria] = useState("Basicos");
  const [guardando, setGuardando] = useState(false);

  const cargarTodo = useCallback(async (signal?: AbortSignal) => {
    setCargando(true);
    setError(null);
    try {
      const [resP, resProv] = await Promise.all([
        fetch("/api/admin/abastos/productos", { signal }),
        fetch("/api/admin/abastos/proveedores", { signal }),
      ]);
      if (resP.ok) {
        const data = await resP.json();
        setProductos(Array.isArray(data?.productos) ? data.productos : []);
      } else {
        setProductos([]);
      }
      if (resProv.ok) {
        const data = await resProv.json();
        setProveedores(Array.isArray(data?.proveedores) ? data.proveedores : []);
      } else {
        setProveedores([]);
      }
    } catch (e) {
      if ((e as { name?: string }).name === "AbortError") return;
      setProductos([]);
      setProveedores([]);
      setError("Error de conexión");
    } finally {
      setCargando(false);
    }
  }, []);

  useFetchConAbort((signal) => cargarTodo(signal), [cargarTodo]);

  async function crear(e: React.FormEvent) {
    e.preventDefault();
    if (!nombre.trim() || creando) return;
    setCreando(true);
    setError(null);
    try {
      const body: Record<string, unknown> = { nombre: nombre.trim(), unidad, categoria };
      const provVal = proveedorId;
      const precVal = precioInicial;
      if (provVal && precVal && Number(precVal) > 0) {
        body.proveedorId = provVal;
        body.precio = Number(precVal);
      }
      const res = await fetch("/api/admin/abastos/productos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data?.error || "Error al crear producto");
        return;
      }
      setNombre("");
      setPrecioInicial("");
      setProveedorId("");
      cargarTodo();
    } catch {
      setError("Error de conexión");
    } finally {
      setCreando(false);
    }
  }

  async function toggleActivo(p: Producto) {
    setProductos((prev) =>
      prev.map((x) => (x.id === p.id ? { ...x, activo: !x.activo } : x))
    );
    try {
      const res = await fetch(`/api/admin/abastos/productos/${p.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activo: !p.activo }),
      });
      if (!res.ok) {
        setProductos((prev) =>
          prev.map((x) => (x.id === p.id ? { ...x, activo: p.activo } : x))
        );
      }
    } catch {
      setProductos((prev) =>
        prev.map((x) => (x.id === p.id ? { ...x, activo: p.activo } : x))
      );
    }
  }

  function iniciarEdicion(p: Producto) {
    setEditandoId(p.id);
    setEditNombre(p.nombre);
    setEditUnidad(p.unidad);
    setEditCategoria(p.categoria);
  }

  function cancelarEdicion() {
    setEditandoId(null);
  }

  async function guardarEdicion(id: string) {
    if (!editNombre.trim() || guardando) return;
    setGuardando(true);
    try {
      const res = await fetch(`/api/admin/abastos/productos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: editNombre.trim(),
          unidad: editUnidad,
          categoria: editCategoria,
        }),
      });
      if (res.ok) {
        setEditandoId(null);
        cargarTodo();
      }
    } catch {
      // silent
    } finally {
      setGuardando(false);
    }
  }

  const agrupados = productos.reduce<Record<string, Producto[]>>((acc, p) => {
    const cat = p.categoria || "Sin categoria";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(p);
    return acc;
  }, {});

  return (
    <div>
      <form onSubmit={crear} className="bg-white rounded-2xl p-5 shadow-sm mb-4 space-y-3">
        <h3 className="font-black text-gray-800">Agregar producto</h3>
        <input
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Nombre del producto"
          required
          className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-300"
        />
        <div className="flex gap-3">
          <select
            value={unidad}
            onChange={(e) => setUnidad(e.target.value)}
            className="flex-1 p-3 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-300 bg-white"
          >
            <option value="kg">kg</option>
            <option value="litro">litro</option>
            <option value="pieza">pieza</option>
            <option value="docena">docena</option>
            <option value="paquete">paquete</option>
          </select>
          <select
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            className="flex-1 p-3 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-300 bg-white"
          >
            <option value="Basicos">Basicos</option>
            <option value="Carnes">Carnes</option>
            <option value="Mariscos">Mariscos</option>
            <option value="Verduras">Verduras</option>
            <option value="Frutas">Frutas</option>
            <option value="Lacteos">Lacteos</option>
            <option value="Bebidas">Bebidas</option>
            <option value="Tortilleria">Tortilleria</option>
            <option value="Varios">Varios</option>
          </select>
        </div>
        <div className="flex gap-3">
          <select
            value={proveedorId}
            onChange={(e) => setProveedorId(e.target.value)}
            className="flex-1 p-3 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-300 bg-white"
          >
            <option value="">Proveedor (opcional)</option>
            {proveedores.filter((p) => p.activo).map((p) => (
              <option key={p.id} value={p.id}>{p.nombre}</option>
            ))}
          </select>
          <input
            value={precioInicial}
            onChange={(e) => setPrecioInicial(e.target.value)}
            type="number"
            step="0.01"
            min="0"
            placeholder="Precio $ (opcional)"
            disabled={!proveedorId}
            className="flex-1 p-3 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-300 disabled:opacity-40"
          />
        </div>
        <p className="text-[10px] text-gray-400 -mt-1">
          Si agregas proveedor + precio, se crea el precio verificado automáticamente.
        </p>
        <button
          type="submit"
          disabled={creando}
          className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold disabled:opacity-50"
        >
          {creando ? "Agregando…" : "+ Agregar producto"}
        </button>
        {error && <p className="text-red-500 text-xs">{error}</p>}
      </form>

      {cargando ? (
        <p className="text-center text-gray-500 py-8">Cargando…</p>
      ) : (
        <div className="space-y-4">
          {Object.entries(agrupados).map(([cat, items]) => (
            <div key={cat}>
              <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">{cat}</h4>
              <div className="space-y-2">
                {items.map((p) => (
                  <div key={p.id} className="bg-white rounded-xl p-4 shadow-sm">
                    {editandoId === p.id ? (
                      <div className="space-y-3">
                        <input
                          value={editNombre}
                          onChange={(e) => setEditNombre(e.target.value)}
                          placeholder="Nombre"
                          className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-300"
                        />
                        <div className="flex gap-3">
                          <select
                            value={editUnidad}
                            onChange={(e) => setEditUnidad(e.target.value)}
                            className="flex-1 p-3 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-300 bg-white"
                          >
                            <option value="kg">kg</option>
                            <option value="litro">litro</option>
                            <option value="pieza">pieza</option>
                            <option value="docena">docena</option>
                            <option value="paquete">paquete</option>
                          </select>
                          <select
                            value={editCategoria}
                            onChange={(e) => setEditCategoria(e.target.value)}
                            className="flex-1 p-3 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-300 bg-white"
                          >
                            <option value="Basicos">Basicos</option>
                            <option value="Carnes">Carnes</option>
                            <option value="Mariscos">Mariscos</option>
                            <option value="Verduras">Verduras</option>
                            <option value="Frutas">Frutas</option>
                            <option value="Lacteos">Lacteos</option>
                            <option value="Bebidas">Bebidas</option>
                            <option value="Tortilleria">Tortilleria</option>
                            <option value="Varios">Varios</option>
                          </select>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => guardarEdicion(p.id)}
                            disabled={guardando}
                            className="flex-1 bg-blue-600 text-white py-2 rounded-xl font-bold text-sm disabled:opacity-50"
                          >
                            {guardando ? "Guardando…" : "Guardar"}
                          </button>
                          <button
                            onClick={cancelarEdicion}
                            className="px-4 py-2 rounded-xl font-bold text-sm bg-gray-100 text-gray-600 hover:bg-gray-200"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`font-bold ${p.activo ? "text-gray-800" : "text-gray-400"}`}>
                            {p.nombre}
                          </span>
                          <span className="text-[10px] text-gray-400">({p.unidad})</span>
                          {!p.activo && (
                            <span className="text-[10px] font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                              INACTIVO
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => iniciarEdicion(p)}
                            className="text-xs font-bold px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => toggleActivo(p)}
                            className={`text-xs font-bold px-3 py-1.5 rounded-lg ${
                              p.activo
                                ? "bg-red-100 text-red-700 hover:bg-red-200"
                                : "bg-green-100 text-green-700 hover:bg-green-200"
                            }`}
                          >
                            {p.activo ? "Desactivar" : "Activar"}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SeccionPrecios() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [productoId, setProductoId] = useState("");
  const [proveedorId, setProveedorId] = useState("");
  const [precio, setPrecio] = useState("");
  const [unidad, setUnidad] = useState("kg");
  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [resultado, setResultado] = useState<{ tipo: "ok" | "error"; msg: string } | null>(null);
  const [desactualizados, setDesactualizados] = useState<ProductoDesactualizado[]>([]);
  const [bannerAbierto, setBannerAbierto] = useState(true);

  useFetchConAbort(async (signal) => {
    try {
      const [resP, resProv, resDes] = await Promise.all([
        fetch("/api/admin/abastos/productos", { signal }),
        fetch("/api/admin/abastos/proveedores", { signal }),
        fetch("/api/admin/abastos/productos/desactualizados", { signal }),
      ]);
      if (!resP.ok || !resProv.ok) {
        setProductos([]);
        setProveedores([]);
        return;
      }
      const dataP = await resP.json();
      const dataProv = await resProv.json();
      setProductos(
        Array.isArray(dataP?.productos)
          ? (dataP.productos as Producto[])
              .filter((p: Producto) => p.activo)
              .sort((a, b) => a.nombre.localeCompare(b.nombre, "es"))
          : []
      );
      setProveedores(
        Array.isArray(dataProv?.proveedores)
          ? dataProv.proveedores.filter((p: Proveedor) => p.activo)
          : []
      );
      if (resDes.ok) {
        const dataDes = await resDes.json();
        setDesactualizados(Array.isArray(dataDes?.productos) ? dataDes.productos : []);
      }
    } catch (e) {
      if ((e as { name?: string }).name === "AbortError") return;
      setProductos([]);
      setProveedores([]);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    if (productoId) {
      const p = productos.find((x) => x.id === productoId);
      if (p) setUnidad(p.unidad);
    }
  }, [productoId, productos]);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    if (!productoId || !proveedorId || !precio || enviando) return;
    setEnviando(true);
    setResultado(null);
    try {
      const res = await fetch("/api/admin/abastos/precios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productoId,
          proveedorId,
          precio: Number(precio),
          unidad,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setResultado({ tipo: "ok", msg: "✓ Precio registrado exitosamente" });
        setPrecio("");
      } else {
        setResultado({ tipo: "error", msg: data?.error || "Error al guardar" });
      }
    } catch {
      setResultado({ tipo: "error", msg: "Error de conexión" });
    } finally {
      setEnviando(false);
    }
  }

  if (cargando) return <p className="text-center text-gray-500 py-8">Cargando…</p>;

  const pendientes = desactualizados.filter((d) => d.sinPrecio);
  const vencidos = desactualizados.filter((d) => !d.sinPrecio);

  return (
    <div className="space-y-4">
      {desactualizados.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-2xl overflow-hidden">
          <button
            type="button"
            onClick={() => setBannerAbierto(!bannerAbierto)}
            className="w-full flex items-center justify-between p-4 text-left"
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">🟠</span>
              <span className="font-bold text-sm text-orange-800">
                {desactualizados.length} producto{desactualizados.length !== 1 ? "s" : ""} necesita{desactualizados.length === 1 ? "" : "n"} actualización
              </span>
            </div>
            <span className="text-orange-500 text-sm">{bannerAbierto ? "▲" : "▼"}</span>
          </button>

          {bannerAbierto && (
            <div className="px-4 pb-4 space-y-2">
              {pendientes.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold text-orange-600 uppercase tracking-widest mb-1.5">
                    Sin precio registrado
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {pendientes.map((p) => (
                      <span key={p.id} className="text-xs font-bold bg-orange-100 text-orange-700 px-2 py-1 rounded-lg">
                        {p.nombre}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {vencidos.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold text-orange-600 uppercase tracking-widest mb-1.5">
                    Último precio hace +{14} días
                  </p>
                  <div className="space-y-1">
                    {vencidos.map((p) => (
                      <div key={p.id} className="flex items-center justify-between text-sm bg-white rounded-lg px-3 py-2">
                        <div>
                          <span className="font-bold text-gray-800">{p.nombre}</span>
                          <span className="text-gray-400 ml-1 text-[10px]">({p.unidad})</span>
                        </div>
                        <div className="text-right text-xs text-gray-500">
                          <span className="font-bold text-orange-600">{p.diasDesdeActualizacion} días</span>
                          {p.ultimoProveedor && (
                            <span className="ml-2">· {p.ultimoProveedor}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <div className="bg-white rounded-2xl p-5 shadow-sm space-y-4">
        <h3 className="font-black text-gray-800">Cargar precio directo</h3>
        <p className="text-xs text-gray-500">Este precio se marca como verificado y aparece inmediatamente.</p>

      <form onSubmit={enviar} className="space-y-3">
        <div>
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Producto</label>
          <BuscadorProducto
            productos={productos}
            value={productoId}
            onChange={setProductoId}
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Proveedor</label>
          <select
            value={proveedorId}
            onChange={(e) => setProveedorId(e.target.value)}
            required
            className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-300 bg-white"
          >
            <option value="">Seleccionar proveedor…</option>
            {proveedores.map((p) => (
              <option key={p.id} value={p.id}>{p.nombre}</option>
            ))}
          </select>
        </div>
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Precio ($)</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={precio}
              onChange={(e) => setPrecio(e.target.value)}
              required
              placeholder="0.00"
              className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-300"
            />
          </div>
          <div className="w-32">
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Unidad</label>
            <input
              value={unidad}
              onChange={(e) => setUnidad(e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-500"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={enviando}
          className="w-full bg-green-600 text-white py-3 rounded-xl font-bold disabled:opacity-50"
        >
          {enviando ? "Guardando…" : "Guardar precio"}
        </button>
        {resultado && (
          <p className={`text-sm font-bold text-center ${resultado.tipo === "ok" ? "text-green-600" : "text-red-600"}`}>
            {resultado.msg}
          </p>
        )}
      </form>
    </div>
    </div>
  );
}

function SeccionReportes() {
  const [reportes, setReportes] = useState<Reporte[]>([]);
  const [cargando, setCargando] = useState(true);
  const [ocupados, setOcupados] = useState<Set<string>>(new Set());

  const cargar = useCallback(async (signal?: AbortSignal) => {
    setCargando(true);
    try {
      const res = await fetch("/api/admin/abastos/reportes", { signal });
      if (!res.ok) {
        setReportes([]);
        return;
      }
      const data = await res.json();
      setReportes(Array.isArray(data?.reportes) ? data.reportes : []);
    } catch (e) {
      if ((e as { name?: string }).name === "AbortError") return;
      setReportes([]);
    } finally {
      setCargando(false);
    }
  }, []);

  useFetchConAbort((signal) => cargar(signal), [cargar]);

  async function accion(id: string, tipo: "aprobar" | "rechazar") {
    setOcupados((prev) => new Set(prev).add(id));
    try {
      const res = await fetch(`/api/admin/abastos/reportes/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accion: tipo }),
      });
      if (!res.ok) return;
      setReportes((prev) => prev.filter((r) => r.id !== id));
    } catch {
      // si falla, el reporte queda visible para reintentar
    } finally {
      setOcupados((prev) => { const n = new Set(prev); n.delete(id); return n; });
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-black text-gray-800">Reportes pendientes</h3>
        <button
          onClick={() => cargar()}
          className="text-xs font-bold text-blue-600 hover:underline"
        >
          Recargar
        </button>
      </div>

      {cargando ? (
        <div className="flex items-center justify-center py-8 text-gray-500">
          <Loader2 className="w-5 h-5 animate-spin mr-2" />
          Cargando…
        </div>
      ) : reportes.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 shadow-sm text-center">
          <p className="text-gray-400 font-bold text-lg">0</p>
          <p className="text-gray-400 text-sm">Sin reportes pendientes</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reportes.map((r) => (
            <div key={r.id} className="bg-white rounded-2xl p-5 shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-black text-gray-800">{r.producto.nombre}</h4>
                  <p className="text-xs text-gray-500">
                    {r.proveedor.nombre} · ${Number(r.precio).toFixed(2)} / {r.unidad}
                  </p>
                </div>
                <span className="text-[10px] text-gray-400">
                  {new Date(r.createdAt).toLocaleDateString("es-MX", {
                    day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
                  })}
                </span>
              </div>
              {r.negocio && (
                <p className="text-[10px] text-gray-400 mb-3">
                  Reportado por: <span className="font-bold">{r.negocio.nombre}</span>
                </p>
              )}
              <div className="flex gap-2">
                <button
                  onClick={() => accion(r.id, "aprobar")}
                  disabled={ocupados.has(r.id)}
                  className="flex-1 py-2 rounded-xl text-xs font-bold bg-green-100 text-green-700 hover:bg-green-200 disabled:opacity-50"
                >
                  ✓ Aprobar
                </button>
                <button
                  onClick={() => accion(r.id, "rechazar")}
                  disabled={ocupados.has(r.id)}
                  className="flex-1 py-2 rounded-xl text-xs font-bold bg-red-100 text-red-700 hover:bg-red-200 disabled:opacity-50"
                >
                  ✗ Rechazar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

type ProductoDesactualizado = {
  id: string;
  nombre: string;
  unidad: string;
  categoria: string;
  ultimoPrecio: string | null;
  ultimoProveedor: string | null;
  diasDesdeActualizacion: number | null;
  sinPrecio: boolean;
  proveedoresConPrecio: number;
};

type MetricasData = {
  hoy: { busquedas: number; agregadosLista: number; comparaciones: number; reportes: number; contactarWhatsapp: number; total: number };
  semana: { busquedas: number; agregadosLista: number; comparaciones: number; reportes: number; contactarWhatsapp: number; total: number };
  cobertura: { porcentaje: number; productosConPrecio: number; totalProductos: number };
  productosSinPrecio: string[];
  productosDesactualizados: ProductoDesactualizado[];
  whatsappPorProveedor: { proveedorNombre: string; hoy: number; semana: number; mes: number }[];
  umbralDias: number;
};

const LABELS: Record<string, string> = {
  busqueda: "Búsqueda",
  agregar_lista: "Agregar a lista",
  comparar: "Comparación",
  reportar: "Reporte",
  contactar_whatsapp: "WhatsApp",
};

const ICONS: Record<string, typeof Search> = {
  busqueda: Search,
  agregar_lista: ShoppingCart,
  comparar: BarChart3,
  reportar: Users,
  contactar_whatsapp: MessageCircle as unknown as typeof Search,
};

function SeccionMetricas() {
  const [data, setData] = useState<MetricasData | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [eventos, setEventos] = useState<{ id: string; tipo: string; metadata: Record<string, unknown>; fecha: string }[]>([]);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [cargandoEventos, setCargandoEventos] = useState(true);

  const cargarEventos = useCallback(async (nuevoOffset = 0) => {
    if (nuevoOffset === 0) setCargandoEventos(true);
    try {
      const res = await fetch(`/api/admin/abastos/metricas/eventos?offset=${nuevoOffset}&limit=10`);
      if (!res.ok) return;
      const json = await res.json();
      if (nuevoOffset === 0) {
        setEventos(json.eventos);
      } else {
        setEventos((prev) => [...prev, ...json.eventos]);
      }
      setOffset(json.offset);
      setHasMore(json.hasMore);
    } catch {
      // silent
    } finally {
      setCargandoEventos(false);
    }
  }, []);

  useEffect(() => {
    const ctl = new AbortController();
    fetch("/api/admin/abastos/metricas", { signal: ctl.signal })
      .then(async (r) => {
        if (!r.ok) throw new Error("Error al cargar métricas");
        const json = await r.json();
        setData(json);
      })
      .catch((e) => {
        if (e.name !== "AbortError") setError(e.message);
      })
      .finally(() => setCargando(false));
    return () => ctl.abort();
  }, []);

  useEffect(() => {
    cargarEventos(0);
  }, [cargarEventos]);

  if (cargando) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-center">
        <p className="text-sm font-bold text-red-700">{error || "Error al cargar"}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
            Búsquedas hoy
          </p>
          <p className="text-3xl font-black text-midnight">{data.hoy.busquedas}</p>
          <p className="text-xs text-gray-400 mt-1">
            {data.semana.busquedas} en la última semana
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
            Contactos WhatsApp
          </p>
          <p className="text-3xl font-black text-emerald-600">{data.hoy.contactarWhatsapp}</p>
          <p className="text-xs text-gray-400 mt-1">
            {data.semana.contactarWhatsapp} en la última semana
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
            Cobertura de precios
          </p>
          <p className="text-3xl font-black text-midnight">{data.cobertura.porcentaje}%</p>
          <p className="text-xs text-gray-400 mt-1">
            {data.cobertura.productosConPrecio} de {data.cobertura.totalProductos} productos con precio
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
            Eventos hoy
          </p>
          <p className="text-3xl font-black text-midnight">{data.hoy.total}</p>
          <p className="text-xs text-gray-400 mt-1">
            {data.semana.total} en la última semana
          </p>
        </div>
      </div>

      {data.productosSinPrecio.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4">
          <p className="text-[10px] font-bold text-orange-600 uppercase tracking-widest mb-2">
            Productos sin precio activo
          </p>
          <div className="flex flex-wrap gap-1.5">
            {data.productosSinPrecio.map((nombre) => (
              <span key={nombre} className="text-xs font-bold bg-orange-100 text-orange-700 px-2 py-1 rounded-lg">
                {nombre}
              </span>
            ))}
          </div>
        </div>
      )}

      {data.productosDesactualizados && data.productosDesactualizados.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-bold text-orange-600 uppercase tracking-widest">
              Productos desactualizados (+{data.umbralDias} días)
            </p>
            <span className="text-2xl font-black text-orange-600">{data.productosDesactualizados.length}</span>
          </div>
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {data.productosDesactualizados.map((p) => (
              <div key={p.id} className="flex items-center justify-between text-sm bg-white rounded-lg px-3 py-2">
                <div className="min-w-0">
                  <span className="font-bold text-gray-800">{p.nombre}</span>
                  <span className="text-gray-400 ml-1 text-[10px]">({p.unidad})</span>
                  {p.sinPrecio && (
                    <span className="text-[10px] font-bold bg-red-100 text-red-700 px-1.5 py-0.5 rounded ml-1">
                      SIN PRECIO
                    </span>
                  )}
                </div>
                <div className="text-right text-xs text-gray-500 shrink-0 ml-2">
                  {p.diasDesdeActualizacion !== null ? (
                    <span className="font-bold text-orange-600">{p.diasDesdeActualizacion} días</span>
                  ) : (
                    <span className="text-red-500">—</span>
                  )}
                  {p.ultimoProveedor && (
                    <span className="ml-1">· {p.ultimoProveedor}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.whatsappPorProveedor && data.whatsappPorProveedor.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-emerald-500" />
            <h3 className="text-sm font-bold text-midnight">Contactos WhatsApp por proveedor</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left p-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Proveedor</th>
                  <th className="text-right p-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Hoy</th>
                  <th className="text-right p-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Semana</th>
                  <th className="text-right p-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Mes</th>
                </tr>
              </thead>
              <tbody>
                {data.whatsappPorProveedor.map((r) => (
                  <tr key={r.proveedorNombre} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="p-3 font-bold text-gray-800">{r.proveedorNombre}</td>
                    <td className={`p-3 text-right font-bold ${r.hoy > 0 ? "text-emerald-600" : "text-gray-400"}`}>{r.hoy}</td>
                    <td className={`p-3 text-right font-bold ${r.semana > 0 ? "text-emerald-600" : "text-gray-400"}`}>{r.semana}</td>
                    <td className={`p-3 text-right font-bold ${r.mes > 0 ? "text-emerald-600" : "text-gray-400"}`}>{r.mes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <h3 className="text-sm font-bold text-midnight">Últimos eventos</h3>
        </div>
        {cargandoEventos ? (
          <div className="flex items-center justify-center py-8 text-gray-500">
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            Cargando eventos…
          </div>
        ) : eventos.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-400">
            No hay eventos registrados aún
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left p-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Evento</th>
                    <th className="text-left p-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Detalle</th>
                    <th className="text-right p-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {eventos.map((ev) => {
                    const Icon = ICONS[ev.tipo] ?? Search;
                    const metadata = ev.metadata as Record<string, unknown> | undefined;
                    return (
                      <tr key={ev.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                        <td className="p-3">
                          <span className="inline-flex items-center gap-1.5 font-bold text-midnight">
                            <Icon className="w-3.5 h-3.5 text-gray-400" />
                            {LABELS[ev.tipo] ?? ev.tipo}
                          </span>
                        </td>
                        <td className="p-3 text-gray-500 text-xs">
                          {ev.tipo === "busqueda" && `"${String(metadata?.query ?? "")}" → ${String(metadata?.resultados ?? "")} resultados`}
                          {ev.tipo === "agregar_lista" && String(metadata?.productoNombre ?? "")}
                          {ev.tipo === "comparar" && `${String(metadata?.items ?? "")} items`}
                          {ev.tipo === "reportar" && `prod:${String(metadata?.productoId ?? "").slice(0, 8)}...`}
                          {ev.tipo === "contactar_whatsapp" && (
                            <span className="text-emerald-600 font-bold">📱 {String(metadata?.proveedorNombre ?? "")}</span>
                          )}
                        </td>
                        <td className="p-3 text-right text-xs text-gray-400 whitespace-nowrap">
                          {new Date(ev.fecha).toLocaleDateString("es-MX", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {hasMore && (
              <div className="p-4 text-center">
                <button
                  onClick={() => cargarEventos(offset)}
                  disabled={cargandoEventos}
                  className="text-xs font-bold text-blue-600 hover:underline disabled:opacity-50"
                >
                  {cargandoEventos ? "Cargando…" : "Ver más eventos"}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
