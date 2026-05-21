"use client";

import { useState, useEffect, useCallback } from "react";
import {
  calcularFactiram,
  calcularPrediccion,
  type FactiramInput,
  type ProductoInput,
} from "@/lib/factiram-engine";

// ── Categorías de costos — orden canónico, siempre las 6 ──
const CATEGORIAS_GASTO = [
  { key: "RENTA",      label: "RENTA" },
  { key: "LUZ_AGUA",   label: "LUZ / AGUA" },
  { key: "INTERNET",   label: "INTERNET" },
  { key: "SUELDOS",    label: "SUELDOS" },
  { key: "PUBLICIDAD", label: "PUBLICIDAD" },
  { key: "OTROS",      label: "OTROS" },
] as const;

type CostoEditable = { categoria: string; monto: number };
type SaveState = "idle" | "saving" | "ok" | "error";

// Semáforo basado en margen sobre precio de venta
function getSemaforo(costoCompra: number, precioVenta: number): "BUENO" | "REGULAR" | "MALO" {
  if (precioVenta <= 0 || costoCompra >= precioVenta) return "MALO";
  const margen = (precioVenta - costoCompra) / precioVenta;
  if (margen >= 0.30) return "BUENO";
  if (margen >= 0.15) return "REGULAR";
  return "MALO";
}

const SEMAFORO = {
  BUENO:   { dot: "bg-green-500",  texto: "text-green-700",  bg: "bg-green-50",  label: "Bueno" },
  REGULAR: { dot: "bg-yellow-400", texto: "text-yellow-700", bg: "bg-yellow-50", label: "Regular" },
  MALO:    { dot: "bg-red-500",    texto: "text-red-700",    bg: "bg-red-50",    label: "Malo" },
};

type Props = {
  negocioId: string;
  negocioNombre: string;
  slug: string;
  esTrial?: boolean;
  data: {
    productos: ProductoInput[];
    costosFijos: FactiramInput["costosFijos"];
    diasLaborales: number;
    inversionMercancia: number;
  };
};

export default function DashboardDueno({ negocioId, negocioNombre, slug, data }: Props) {
  // ── Datos del día (vienen del API — polling) ─────────────
  const [piezasVendidasHoy, setPiezasVendidasHoy] = useState(0);
  const [efectivoHoy, setEfectivoHoy] = useState(0);
  const [gastosHoy, setGastosHoy] = useState(0);

  // ── Configuración editable ───────────────────────────────
  const [productos, setProductos] = useState<ProductoInput[]>(data.productos);

  // Inicializar costos por categoría — garantiza las 6 presentes en orden
  const costosPorCat: Record<string, number> = Object.fromEntries(
    data.costosFijos.map((c) => [c.categoria, c.monto])
  );
  const [costosFijos, setCostosFijos] = useState<CostoEditable[]>(
    CATEGORIAS_GASTO.map((cat) => ({
      categoria: cat.key,
      monto: costosPorCat[cat.key] ?? 0,
    }))
  );

  const [diasLaborales, setDiasLaborales] = useState(data.diasLaborales);
  const [inversionMercancia, setInversionMercancia] = useState<number>(
    Number.isFinite(data.inversionMercancia) && data.inversionMercancia > 0
      ? data.inversionMercancia
      : 0
  );
  // Input controlado: string para permitir vaciar el campo sin saltar a 0.
  const [inversionInput, setInversionInput] = useState<string>(
    inversionMercancia > 0 ? String(inversionMercancia) : ""
  );
  const [horaActual, setHoraActual] = useState(new Date().getHours());

  // ── Estado de guardado ───────────────────────────────────
  const [costosSave, setCostosSave] = useState<SaveState>("idle");
  const [productosSave, setProductosSave] = useState<SaveState>("idle");
  const [inversionSave, setInversionSave] = useState<SaveState>("idle");

  // ── Polling unificado cada 60s, solo si la pestaña está visible ──
  const fetchResumen = useCallback(async () => {
    try {
      const res = await fetch(`/api/dashboard/resumen?negocioId=${negocioId}`, {
        cache: "no-store",
      });
      if (!res.ok) return;
      const json = await res.json();
      setPiezasVendidasHoy(json.piezasVendidas ?? 0);
      setEfectivoHoy(Number(json.efectivoHoy ?? 0));
      setGastosHoy(Number(json.gastosHoy ?? 0));
    } catch (e) {
      console.error("Error al leer resumen", e);
    }
  }, [negocioId]);

  useEffect(() => {
    fetchResumen();

    const pollInterval = setInterval(() => {
      if (typeof document !== "undefined" && document.visibilityState === "visible") {
        fetchResumen();
      }
    }, 60000);

    const horaInterval = setInterval(() => {
      setHoraActual(new Date().getHours());
    }, 60000);

    return () => {
      clearInterval(pollInterval);
      clearInterval(horaInterval);
    };
  }, [fetchResumen]);

  // ── Motor financiero (única fuente de cálculo) ───────────
  const input: FactiramInput = {
    productos,
    costosFijos,
    diasLaborales,
    piezasVendidasHoy,
    efectivoHoy,
    inversionMercancia,
    gastosHoy,
  };

  const r = calcularFactiram(input);
  const prediccion = calcularPrediccion(input, horaActual);

  const costoPorDia = r.totalCostosFijos / (diasLaborales || 26);
  const utilidadRealHoy = r.flujoRealHoy - costoPorDia;

  // Porcentaje de recuperación redondeado para la pill del header
  const pctRecuperacion = Math.round(r.recuperacion.porcentaje);

  // Detecta si el dueño aún no ha configurado el promedio diario en ningún producto
  const sinPromedioConfigurado = productos.every(
    (p) => Number(p.piezasDia) === 0
  );

  // ── Diagnóstico mensual ──────────────────────────────────
  let diagnostico = "";
  let accion = "";
  if (r.utilidadMes < 0) {
    diagnostico = "Tu negocio está en riesgo";
    accion = "Necesitas vender más o bajar costos";
  } else if (productos.length === 1) {
    diagnostico = "Dependes de un solo producto";
    accion = "Diversifica antes de que sea un problema";
  } else {
    diagnostico = "Tu negocio es rentable";
    accion = `Empuja más "${r.productoEstrella}"`;
  }

  // ── Handlers de configuración ────────────────────────────
  function actualizarProducto(idx: number, campo: keyof ProductoInput, valor: string | number) {
    setProductos((prev) => prev.map((p, i) => (i === idx ? { ...p, [campo]: valor } : p)));
    setProductosSave("idle");
  }

  async function agregarProducto() {
    try {
      const res = await fetch("/api/config/productos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ negocioId }),
      });
      if (!res.ok) throw new Error();
      const nuevo = await res.json();
      setProductos((prev) => [...prev, nuevo]);
    } catch (e) {
      console.error("Error al crear producto", e);
    }
  }

  async function eliminarProducto(idx: number) {
    if (!confirm("¿Seguro que quieres eliminar este producto?")) return;
    const p = productos[idx];
    try {
      await fetch(`/api/config/productos?productoId=${p.id}&negocioId=${negocioId}`, {
        method: "DELETE",
      });
      setProductos((prev) => prev.filter((_, i) => i !== idx));
    } catch (e) {
      console.error("Error al eliminar producto", e);
    }
  }

  function actualizarCosto(idx: number, monto: number) {
    setCostosFijos((prev) => prev.map((c, i) => (i === idx ? { ...c, monto } : c)));
    setCostosSave("idle");
  }

  async function guardarCostos() {
    setCostosSave("saving");
    try {
      const res = await fetch("/api/config/costos", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ negocioId, costos: costosFijos }),
      });
      if (!res.ok) throw new Error();
      setCostosSave("ok");
      setTimeout(() => setCostosSave("idle"), 2500);
    } catch {
      setCostosSave("error");
    }
  }

  async function guardarProductos() {
    setProductosSave("saving");
    try {
      const res = await fetch("/api/config/productos", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ negocioId, productos }),
      });
      if (!res.ok) throw new Error();
      setProductosSave("ok");
      setTimeout(() => setProductosSave("idle"), 2500);
    } catch {
      setProductosSave("error");
    }
  }

  async function guardarInversion() {
    const parsed = inversionInput.trim() === "" ? 0 : Number(inversionInput);
    const monto = Number.isFinite(parsed) && parsed > 0 ? parsed : 0;

    setInversionSave("saving");
    try {
      const res = await fetch("/api/config/negocio", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ negocioId, inversionMercancia: monto }),
      });
      if (!res.ok) throw new Error();
      const json = await res.json();
      const persistido = Number(json.inversionMercancia ?? monto);
      setInversionMercancia(persistido);
      setInversionInput(persistido > 0 ? String(persistido) : "");
      setInversionSave("ok");
      setTimeout(() => setInversionSave("idle"), 2500);
    } catch {
      setInversionSave("error");
    }
  }

  function cerrarMes() {
    if (!confirm("¿Cerrar el mes? Esta acción reiniciará los contadores del día.")) return;
    setPiezasVendidasHoy(0);
    setEfectivoHoy(0);
    setGastosHoy(0);
  }

  async function cerrarSesion() {
    try {
      await fetch("/api/auth/factiram", { method: "DELETE" });
    } catch {
      // Aunque falle el DELETE, mandamos al login: el guard del page redirige
      // si la cookie ya no es válida.
    }
    window.location.href = `/${slug}/login`;
  }

  const btnGuardar = (state: SaveState, onSave: () => void) => (
    <button
      onClick={onSave}
      disabled={state === "saving"}
      className={`w-full py-2 rounded-xl font-bold text-sm transition-colors disabled:opacity-50 ${
        state === "ok"    ? "bg-green-100 text-green-700" :
        state === "error" ? "bg-red-100 text-red-700 cursor-pointer" :
                            "bg-blue-600 text-white active:bg-blue-700"
      }`}
    >
      {state === "saving" ? "Guardando..." :
       state === "ok"     ? "✓ Guardado" :
       state === "error"  ? "Error — intentar de nuevo" :
                            "Guardar cambios"}
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-100 p-4 max-w-md mx-auto pb-10">

      {/* HEADER */}
      <div className="relative mb-4">
        <div className="text-center">
          <h1 className="text-2xl font-black text-blue-600">FACTIRAM</h1>
          <p className="text-gray-500 text-sm">{negocioNombre}</p>
        </div>
        <button
        onClick={cerrarSesion}
        className="absolute top-0 right-0 rounded-full bg-red-50 px-3 py-1.5 text-xs font-bold text-red-600 border border-red-100 shadow-sm hover:bg-red-100 active:bg-red-200 transition-colors"
        title="Cerrar sesión"
        >
         Salir
        </button>

      </div>

      {/* ALERTA DEL DÍA */}
      <div className={`p-3 rounded-xl mb-4 text-center font-bold text-white ${
        utilidadRealHoy >= 0 ? "bg-green-600" : "bg-red-600"
      }`}>
        {utilidadRealHoy < 0
          ? `Si repites este ritmo mañana, perderás $${Math.abs(Math.round(utilidadRealHoy)).toLocaleString("es-MX")}`
          : "Buen ritmo hoy, sigue así"}
      </div>

      {/* REALIDAD DEL DÍA */}
      <div className={`p-5 rounded-2xl mb-4 text-center ${
        utilidadRealHoy >= 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
      }`}>
        <p className="font-bold text-lg">
          {utilidadRealHoy >= 0 ? "Día en ganancia" : "Día en pérdida"}
        </p>
        <p className="text-sm mt-1">
          {utilidadRealHoy >= 0
            ? `Ganando $${Math.round(utilidadRealHoy).toLocaleString("es-MX")} hoy`
            : `Te faltan $${Math.abs(Math.round(utilidadRealHoy)).toLocaleString("es-MX")} para estar en ganancia`}
        </p>
        <p className="text-xs mt-2 opacity-60">
          {piezasVendidasHoy} vendidas · Meta: {r.metaDiaria} piezas
        </p>
      </div>

      {/* PREDICCIÓN */}
      <div className={`p-4 rounded-xl mb-4 text-center border-2 ${
        prediccion.nivelAlerta === "BIEN"   ? "border-green-300 bg-green-50 text-green-800" :
        prediccion.nivelAlerta === "RIESGO" ? "border-yellow-300 bg-yellow-50 text-yellow-800" :
                                              "border-red-200 bg-red-50 text-red-700"
      }`}>
        <p className="text-xs uppercase font-bold tracking-widest mb-1">
          Si sigues así, hoy terminarás en
        </p>
        <p className="text-3xl font-black">
          ${Math.round(prediccion.proyeccionFlujo).toLocaleString("es-MX")}
        </p>
        <p className="text-xs opacity-60 mt-1">
          ({prediccion.proyeccionPiezas} piezas proyectadas)
        </p>
        <p className="text-sm font-medium mt-2">{prediccion.mensajeAlerta}</p>
      </div>

      {/* EFECTIVO COBRADO (registrado por el cajero, sincronizado en vivo) */}
      <div className="bg-white p-4 rounded-xl mb-4 text-center shadow-sm">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
          Cuánto cobraste hoy
        </p>
        <p className="font-black text-green-600 text-3xl">
          ${efectivoHoy.toLocaleString("es-MX")}
        </p>
        <p className="text-[10px] text-gray-400 mt-1">
          Reportado por el cajero · se actualiza en vivo
        </p>
        {r.dineroCalle > 0 && (
          <p className="text-xs text-orange-500 mt-2 font-medium">
            Dinero en la calle (fiado): ${Math.round(r.dineroCalle).toLocaleString("es-MX")}
          </p>
        )}
        <p className="text-xs text-gray-400 mt-1">
          Gastos del día: ${gastosHoy.toLocaleString("es-MX")}
        </p>
      </div>

      {/* COSTOS FIJOS */}
      <div className="bg-white p-6 rounded-3xl mb-4 shadow-sm">
        <h2 className="text-xl font-bold italic text-center text-slate-800 mb-6">
          ¿Cuánto te cuesta existir mensualmente?
        </h2>

        <div className="border-t border-gray-100 pt-6 mb-6">
          <label className="block text-[10px] font-bold text-gray-400 text-center mb-2 tracking-widest">
            DÍAS QUE TRABAJAS AL MES
          </label>
          <div className="flex justify-center">
            <input
              type="number"
              value={diasLaborales}
              onChange={(e) => setDiasLaborales(Number(e.target.value))}
              className="w-full max-w-xs text-center py-2 text-blue-600 font-bold text-xl border border-gray-200 rounded-xl focus:outline-none focus:border-blue-300"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-5 mb-6">
          {CATEGORIAS_GASTO.map((cat, i) => (
            <div key={cat.key}>
              <label className="block text-[10px] font-bold text-gray-400 mb-1 tracking-wider">
                {cat.label}
              </label>
              <input
                type="number"
                value={costosFijos[i].monto}
                onChange={(e) => actualizarCosto(i, Number(e.target.value))}
                className="w-full p-3 border border-gray-200 rounded-xl text-slate-700 font-medium focus:outline-none focus:border-blue-200 transition-colors"
              />
            </div>
          ))}
        </div>

        <div className="bg-slate-50 rounded-2xl p-4 flex justify-between items-center mb-4">
          <span className="text-slate-500 font-bold text-sm">Gastas aunque no vendas</span>
          <span className="text-slate-800 font-black text-lg">
            ${r.totalCostosFijos.toLocaleString("es-MX")} / mes
          </span>
        </div>

        {btnGuardar(costosSave, guardarCostos)}
      </div>

      {/* CUÁNDO EMPIEZAS A GANAR DE VERDAD */}
      <div className="bg-white p-4 rounded-xl mb-4 shadow-sm">
        <div className="flex justify-between items-start mb-2">
          <p className="font-bold text-sm text-gray-700">Cuándo empiezas a ganar de verdad</p>
          {inversionMercancia > 0 && (
            <span
              className={`text-xs font-bold px-2 py-1 rounded-full ${
                pctRecuperacion >= 80
                  ? "bg-green-100 text-green-700"
                  : pctRecuperacion >= 40
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {pctRecuperacion}%
            </span>
          )}
        </div>

        {inversionMercancia > 0 ? (
          <>
            <div className="bg-gray-200 h-3 rounded-full mb-3 overflow-hidden">
              <div
                className="bg-green-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, r.recuperacion.porcentaje)}%` }}
              />
            </div>

            <p className="text-xs text-gray-500 leading-relaxed">
              Pusiste{" "}
              <span className="font-semibold text-gray-700">
                ${inversionMercancia.toLocaleString("es-MX")}
              </span>{" "}
              en mercancía
            </p>
            <p className="text-xs text-gray-500 leading-relaxed mt-1">
              Llevas cobrados{" "}
              <span className="font-semibold text-gray-700">
                ${Math.round(r.recuperacion.recuperado).toLocaleString("es-MX")}
              </span>
              . Te faltan{" "}
              <span className="font-semibold text-gray-700">
                ${Math.round(r.recuperacion.faltante).toLocaleString("es-MX")}
              </span>{" "}
              por recuperar.
            </p>

            <div className="mt-3 bg-green-50 border-l-4 border-green-400 rounded-r-xl p-3">
              <p className="text-xs text-green-700 leading-relaxed">
                Cada peso que cobras descuenta tu inversión inicial. Una vez que recuperes el 100%,
                todo lo que vendas por encima de tus costos fijos es ganancia tuya.
              </p>
            </div>
          </>
        ) : (
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 mb-3 flex gap-2 items-start">
            <span className="text-orange-500 text-base mt-0.5">⚠️</span>
            <div>
              <p className="text-xs font-bold text-orange-700">
                Falta capturar tu inversión inicial
              </p>
              <p className="text-xs text-orange-600 mt-0.5 leading-relaxed">
                Escribe abajo cuánto dinero metiste en mercancía para que podamos calcular
                cuánto te falta recuperar.
              </p>
            </div>
          </div>
        )}

        {/* Input + guardar — visible siempre, para capturar o corregir */}
        <div className="mt-3 border-t border-gray-100 pt-3">
          <label className="block text-[10px] font-bold text-gray-400 mb-1 tracking-widest">
            ¿CUÁNTO METISTE EN MERCANCÍA?
          </label>
          <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden mb-2">
            <span className="px-2 text-gray-400 text-xs bg-gray-50 self-stretch flex items-center">
              $
            </span>
            <input
              type="number"
              inputMode="decimal"
              min={0}
              value={inversionInput}
              onChange={(e) => {
                setInversionInput(e.target.value);
                setInversionSave("idle");
              }}
              placeholder="0"
              className="flex-1 p-2 text-sm font-medium focus:outline-none min-w-0"
            />
          </div>
          <button
            onClick={guardarInversion}
            disabled={inversionSave === "saving"}
            className={`w-full py-2 rounded-xl font-bold text-sm transition-colors disabled:opacity-50 ${
              inversionSave === "ok"    ? "bg-green-100 text-green-700" :
              inversionSave === "error" ? "bg-red-100 text-red-700 cursor-pointer" :
                                          "bg-blue-600 text-white active:bg-blue-700"
            }`}
          >
            {inversionSave === "saving" ? "Guardando..." :
             inversionSave === "ok"     ? "✓ Guardado" :
             inversionSave === "error"  ? "Error — intentar de nuevo" :
                                          "Guardar inversión"}
          </button>
        </div>
      </div>

      {/* DINERO QUE VAS GANANDO */}
      <div className="bg-black text-white p-5 rounded-2xl mb-4 text-center">
        <p className="text-xs uppercase tracking-widest opacity-60 mb-1">
          Dinero que vas ganando al mes
        </p>
        <p className="text-gray-400 text-xs mb-3">
          Proyección mensual · basada en el campo &quot;Promedio al día&quot; de cada producto
        </p>

        {sinPromedioConfigurado && (
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 mb-3 flex gap-2 items-start text-left">
            <span className="text-orange-500 text-base mt-0.5">⚠️</span>
            <div>
              <p className="text-xs font-bold text-orange-700">Configura el promedio diario</p>
              <p className="text-xs text-orange-600 mt-0.5 leading-relaxed">
                Todos tus productos tienen &quot;Promedio al día&quot; en 0.
                Sube a la sección &quot;Tus productos&quot; y escribe cuántas piezas vendes en promedio cada día.
                Eso actualizará esta proyección.
              </p>
            </div>
          </div>
        )}

        <p className={`text-3xl font-black ${r.utilidadMes >= 0 ? "text-green-400" : "text-red-400"}`}>
          ${Math.round(r.utilidadMes).toLocaleString("es-MX")}
        </p>
        <p className="text-[10px] opacity-40 mt-1">
          basado en el promedio diario de tus productos
        </p>

        <div className="grid grid-cols-2 mt-4 gap-2 text-sm">
          <div className="bg-white/10 rounded-xl p-3">
            <p className="text-[10px] uppercase tracking-widest opacity-60 mb-1">
              Mínimo al mes para no perder
            </p>
            <p className="font-bold">{r.puntoEquilibrio.toLocaleString("es-MX")} pzas</p>
          </div>
          <div className="bg-white/10 rounded-xl p-3">
            <p className="text-[10px] uppercase tracking-widest opacity-60 mb-1">
              Proyección mensual
            </p>
            <p className="font-bold">{Math.round(r.ventasMes).toLocaleString("es-MX")} pzas</p>
          </div>
        </div>

        <p className="text-xs text-gray-400 mt-2 text-center leading-relaxed">
          Esta proyección NO cambia al registrar ventas del día.
          Refleja tu configuración de productos, no el movimiento diario.
        </p>

        {inversionMercancia > 0 && (
          <p className="text-xs text-amber-300 mt-2 text-center leading-relaxed">
            {r.recuperacion.faltante > 0
              ? `Antes de retirar ganancia, aún faltan $${Math.round(r.recuperacion.faltante).toLocaleString("es-MX")} por recuperar de mercancía.`
              : "Ya recuperaste tu inversión inicial en mercancía."}
          </p>
        )}

        {r.negocioEnPerdida && (
          <div className="mt-3 bg-red-50 border-l-4 border-red-400 rounded-r-xl p-3 text-left">
            <p className="text-xs font-bold text-red-700 mb-1">
              Tu negocio está perdiendo dinero cada mes
            </p>
            <p className="text-xs text-red-600 leading-relaxed">
              Con tu configuración actual, gastas más de lo que generas.
              Aumenta el precio de venta, reduce costos fijos o vende más piezas al día.
            </p>
          </div>
        )}

        <p className="mt-3 text-sm opacity-80">{diagnostico}</p>
        <p className="text-xs opacity-50 mt-1">{accion}</p>
      </div>

      {/* TUS PRODUCTOS */}
      <div className="bg-white p-4 rounded-xl mb-4 shadow-sm">
        <h2 className="font-bold mb-4 text-center text-gray-700">Tus productos</h2>

        <div className="space-y-3">
          {productos.map((p, i) => {
            const s = getSemaforo(p.costoCompra, p.precioVenta);
            const col = SEMAFORO[s];
            const gananciaPieza = Number(p.precioVenta) - Number(p.costoCompra);

            return (
              <div key={p.id} className="border border-gray-200 rounded-xl p-3">
                {/* Fila: semáforo + nombre + eliminar */}
                <div className="flex items-center gap-2 mb-3">
                  <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${col.dot}`} />
                  <input
                    value={p.nombre}
                    onChange={(e) => actualizarProducto(i, "nombre", e.target.value)}
                    className="flex-1 font-bold text-sm border-b border-transparent focus:border-gray-300 focus:outline-none bg-transparent"
                    placeholder="Nombre del producto"
                  />
                  <button
                    onClick={() => eliminarProducto(i)}
                    className="text-gray-300 hover:text-red-500 text-xl leading-none ml-1"
                  >
                    ×
                  </button>
                </div>

                {/* Te cuesta / Lo vendes en */}
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                      Te cuesta
                    </p>
                    <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                      <span className="px-2 text-gray-400 text-xs bg-gray-50 self-stretch flex items-center">$</span>
                      <input
                        type="number"
                        value={p.costoCompra}
                        onChange={(e) => actualizarProducto(i, "costoCompra", Number(e.target.value))}
                        className="flex-1 p-2 text-sm font-medium focus:outline-none min-w-0"
                      />
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                      Lo vendes en
                    </p>
                    <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                      <span className="px-2 text-gray-400 text-xs bg-gray-50 self-stretch flex items-center">$</span>
                      <input
                        type="number"
                        value={p.precioVenta}
                        onChange={(e) => actualizarProducto(i, "precioVenta", Number(e.target.value))}
                        className="flex-1 p-2 text-sm font-medium focus:outline-none min-w-0"
                      />
                    </div>
                  </div>
                </div>

                {/* Lo que te deja / Piezas al día */}
                <div className="grid grid-cols-2 gap-2">
                  <div className={`rounded-lg p-2 text-center ${col.bg}`}>
                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">
                      Lo que te deja
                    </p>
                    <p className={`font-black text-sm ${col.texto}`}>
                      ${gananciaPieza > 0
                        ? gananciaPieza.toLocaleString("es-MX", { maximumFractionDigits: 2 })
                        : "0"} / pieza
                    </p>
                    <p className={`text-[10px] ${col.texto} opacity-70`}>{col.label}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                      Promedio al día
                    </p>
                    <input
                      type="number"
                      value={p.piezasDia}
                      onChange={(e) => actualizarProducto(i, "piezasDia", Number(e.target.value))}
                      className="w-full p-2 text-sm font-bold border border-gray-200 rounded-lg focus:outline-none text-center"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex gap-2 mt-4">
          <button
            onClick={agregarProducto}
            className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-xl font-bold text-sm hover:bg-gray-200 transition-colors"
          >
            + Agregar
          </button>
          <div className="flex-1">
            {btnGuardar(productosSave, guardarProductos)}
          </div>
        </div>
      </div>

      {/* ACCIONES */}
      <div className="flex gap-2">
        <button
          onClick={cerrarMes}
          className="flex-1 bg-gray-800 text-white py-2 rounded-xl font-bold text-sm"
        >
          Cerrar mes
        </button>
        <button
          onClick={() => window.print()}
          className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-xl font-bold text-sm"
        >
          PDF
        </button>
      </div>

    </div>
  );
}
