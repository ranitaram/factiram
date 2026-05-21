"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  calcularFactiram,
  type FactiramInput,
} from "@/lib/factiram-engine";

type Props = {
  negocioId: string;
  negocioNombre: string;
  slug: string;
  esTrial?: boolean;
  data: {
    productos: FactiramInput["productos"];
    costosFijos: FactiramInput["costosFijos"];
    diasLaborales: number;
    inversionMercancia: number;
  };
};

export default function VistaCajero({
  negocioId,
  negocioNombre,
  slug,
  data,
}: Props) {
  const [piezasVendidasHoy, setPiezasVendidasHoy] = useState(0);
  const [efectivoSistema, setEfectivoSistema] = useState(0);
  const [efectivoManual, setEfectivoManual] = useState(0);
  const [efectivoManualInput, setEfectivoManualInput] = useState("0");
  const [efectivoSaveState, setEfectivoSaveState] = useState<"idle" | "saving" | "ok" | "error">("idle");
  const [ventasPorProducto, setVentasPorProducto] = useState<Record<string, number>>({});
  const [guardandoId, setGuardandoId] = useState<string | null>(null);
  const [gastosHoy, setGastosHoy] = useState(0);
  const [montoGasto, setMontoGasto] = useState("");
  const [guardandoGasto, setGuardandoGasto] = useState(false);
  const efectivoEditadoRef = useRef(false);

  const fetchResumen = useCallback(async () => {
    try {
      const res = await fetch(`/api/dashboard/resumen?negocioId=${negocioId}`, {
        cache: "no-store",
      });
      if (!res.ok) return;
      const json = await res.json();
      setPiezasVendidasHoy(json.piezasVendidas ?? 0);
      setEfectivoSistema(Number(json.efectivoSistema ?? 0));
      setVentasPorProducto(json.ventasPorProducto ?? {});
      setGastosHoy(Number(json.gastosHoy ?? 0));
      const monto = Number(json.efectivoHoy ?? 0);
      setEfectivoManual(monto);
      if (!efectivoEditadoRef.current) {
        setEfectivoManualInput(String(monto));
      }
    } catch (e) {
      console.error("Error al leer resumen", e);
    }
  }, [negocioId]);

  useEffect(() => {
    fetchResumen();
    const interval = setInterval(() => {
      if (typeof document !== "undefined" && document.visibilityState === "visible") {
        fetchResumen();
      }
    }, 60000);
    return () => clearInterval(interval);
  }, [fetchResumen]);

  // Debounce: persistir el efectivo manual 600ms después de que el cajero deje de teclear
  useEffect(() => {
    if (!efectivoEditadoRef.current) return;
    const valor = Number(efectivoManualInput);
    if (Number.isNaN(valor) || valor < 0) return;

    setEfectivoSaveState("saving");
    const t = setTimeout(async () => {
      try {
        const res = await fetch("/api/efectivo/hoy", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ negocioId, monto: valor }),
        });
        if (!res.ok) throw new Error();
        const json = await res.json();
        setEfectivoManual(Number(json.monto ?? valor));
        setEfectivoSaveState("ok");
        efectivoEditadoRef.current = false;
        setTimeout(() => setEfectivoSaveState("idle"), 1500);
      } catch {
        setEfectivoSaveState("error");
      }
    }, 600);

    return () => clearTimeout(t);
  }, [efectivoManualInput, negocioId]);

  async function cerrarSesion() {
    try {
      await fetch("/api/auth/factiram", { method: "DELETE" });
    } catch {
      // Aunque falle el DELETE, mandamos al login: la cookie se invalida en
      // el siguiente request y el guard del page lo redirige igual.
    }
    window.location.href = `/${slug}/login`;
  }

  async function registrarVenta(productoId: string) {
    if (guardandoId) return;
    setGuardandoId(productoId);
    try {
      await fetch("/api/ventas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ negocioId, productoId, cantidad: 1 }),
      });
      await fetchResumen();
    } catch (e) {
      console.error("Error al registrar venta", e);
    } finally {
      setGuardandoId(null);
    }
  }

  async function registrarGasto() {
    if (!montoGasto || Number(montoGasto) <= 0 || guardandoGasto) return;
    setGuardandoGasto(true);
    try {
      await fetch("/api/gastos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          negocioId,
          monto: Number(montoGasto),
          descripcion: "Caja",
        }),
      });
      setMontoGasto("");
      await fetchResumen();
    } catch (e) {
      console.error("Error al registrar gasto", e);
    } finally {
      setGuardandoGasto(false);
    }
  }

  const sinProductos = data.productos.length === 0;

  const inputCompleto: FactiramInput = {
    ...data,
    piezasVendidasHoy,
    efectivoHoy: efectivoManual,
    gastosHoy,
  };

  const resultado = sinProductos ? null : calcularFactiram(inputCompleto);

  if (sinProductos) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-6 text-center shadow-sm max-w-sm">
          <p className="text-gray-600 font-medium">
            No hay productos registrados. Pide a tu dueño que configure el sistema.
          </p>
        </div>
      </div>
    );
  }

  const { metaDiaria, flujoRealHoy, totalCostosFijos } = resultado!;
  const costoPorDia = totalCostosFijos / (data.diasLaborales || 26);
  const utilidadRealHoy = flujoRealHoy - costoPorDia;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-4 max-w-lg mx-auto pb-10">

      {/* HEADER */}
      <div className="relative w-full mb-6">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-blue-600 tracking-tight">
            FACTIRAM
          </h1>
          <p className="text-gray-500 font-medium text-sm">{negocioNombre}</p>
          <p className="text-gray-400 text-xs capitalize">
            {new Date().toLocaleDateString("es-MX", {
              weekday: "long",
              day: "numeric",
              month: "long",
              timeZone: "America/Mexico_City",
            })}
          </p>
        </div>
       <button
  onClick={cerrarSesion}
  className="absolute top-0 right-0 rounded-full bg-red-50 px-3 py-1.5 text-xs font-bold text-red-600 border border-red-100 shadow-sm hover:bg-red-100 active:bg-red-200 transition-colors"
  title="Cerrar sesión"
>
  Salir
</button>

      </div>

      {/* DINERO REAL HOY */}
      <div className={`w-full rounded-xl p-4 mb-3 text-center border-2 ${
        utilidadRealHoy > 0
          ? "border-green-300 bg-green-50 text-green-800"
          : utilidadRealHoy === 0
          ? "border-yellow-300 bg-yellow-50 text-yellow-800"
          : "border-red-200 bg-red-50 text-red-700"
      }`}>
        <p className="text-xs uppercase font-bold tracking-widest mb-1">
          Dinero real de hoy
        </p>
        <p className="text-4xl font-black">
          ${Math.round(utilidadRealHoy).toLocaleString("es-MX")}
        </p>
        <p className="text-sm mt-1 font-medium">
          {utilidadRealHoy > 0
            ? "Vas ganando dinero"
            : utilidadRealHoy === 0
            ? "Vas justo"
            : `Te faltan $${Math.abs(Math.round(utilidadRealHoy)).toLocaleString("es-MX")} para estar en ganancia`}
        </p>
      </div>

      {/* CONTADOR + PRODUCTOS */}
      <div className="w-full bg-white rounded-2xl p-6 shadow-sm mb-4">
        <p className="text-center text-sm text-gray-500 mb-1">
          Piezas vendidas hoy
        </p>
        <p className="text-5xl font-black text-blue-600 text-center mb-2">
          {piezasVendidasHoy}
        </p>
       {/* <p className="text-center text-xs text-gray-400 mb-6">
          Meta: {metaDiaria} piezas para no perder
        </p> */}

        {/* Barra de progreso hacia meta */}
        <div className="w-full bg-gray-100 rounded-full h-2 mb-6 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              piezasVendidasHoy >= metaDiaria ? "bg-green-500" : "bg-blue-500"
            }`}
            style={{
              width: `${Math.min(100, metaDiaria > 0 ? (piezasVendidasHoy / metaDiaria) * 100 : 0)}%`,
            }}
          />
        </div>

        {/* Botones por producto */}
        <div className="space-y-3">
          {data.productos.map((p) => {
            const vendidas = ventasPorProducto[p.id] ?? 0;
            return (
              <div
                key={p.id}
                className="flex items-center justify-between bg-gray-50 p-3 rounded-xl border"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="font-bold text-sm truncate">{p.nombre}</p>
                    <span className="shrink-0 text-[11px] font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                      {vendidas} vendidos hoy
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">
                    Vendes a ${Number(p.precioVenta).toLocaleString("es-MX")} ·{" "}
                    Ganas ${(Number(p.precioVenta) - Number(p.costoCompra)).toLocaleString("es-MX")}
                  </p>
                </div>
                <button
                  onClick={() => registrarVenta(p.id)}
                  disabled={guardandoId === p.id}
                  className="ml-3 px-4 py-2 rounded-lg bg-blue-600 text-white font-bold text-sm disabled:opacity-50 active:bg-blue-700"
                >
                  {guardandoId === p.id ? "..." : "+1"}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* BLOQUE 1 — EFECTIVO DEL SISTEMA (readonly, automático) */}
      <div className="w-full bg-white rounded-2xl p-5 shadow-sm mb-4 border border-gray-100">
        <p className="text-xs font-bold text-gray-500 uppercase text-center mb-2">
          Cuánto se ingresó en efectivo hoy
        </p>
        <p className="text-center font-black text-gray-700 text-4xl">
          ${efectivoSistema.toLocaleString("es-MX")}
        </p>
        <p className="text-xs text-gray-400 mt-2 italic text-center">
          Registro automático del sistema · Suma de ventas en efectivo
        </p>
      </div>

      {/* BLOQUE 2 — EFECTIVO REGISTRADO POR EL CAJERO (editable, persistido) */}
      <div className="w-full bg-white rounded-2xl p-5 shadow-sm mb-4 border-2 border-blue-100">
        <p className="text-xs font-bold text-blue-600 uppercase text-center mb-2">
          Efectivo registrado por el cajero
        </p>
        <div className="flex items-center justify-center gap-2">
          <span className="text-gray-400 font-bold text-xl">$</span>
          <input
            type="number"
            inputMode="decimal"
            value={efectivoManualInput}
            onChange={(e) => {
              efectivoEditadoRef.current = true;
              setEfectivoManualInput(e.target.value);
            }}
            className="w-40 text-center font-bold text-green-600 text-3xl border border-gray-200 rounded-lg p-2 bg-gray-50 focus:outline-none focus:border-blue-300"
          />
        </div>
        <p className="text-xs mt-2 text-center font-medium">
          {efectivoSaveState === "saving" && <span className="text-gray-400">Guardando…</span>}
          {efectivoSaveState === "ok" && <span className="text-green-600">✓ Guardado — el dueño ya lo ve</span>}
          {efectivoSaveState === "error" && <span className="text-red-500">Error al guardar — vuelve a editar</span>}
          {efectivoSaveState === "idle" && (
            <span className="text-gray-400 italic">
              Lo que el cajero realmente tiene en caja. Se sincroniza con el dashboard del dueño.
            </span>
          )}
        </p>
      </div>

      {/* GASTOS */}
      <div className="w-full bg-white rounded-2xl p-5 shadow-sm mb-4">
        <p className="text-xs font-bold text-gray-500 uppercase text-center mb-3">
          Registrar gasto de hoy
        </p>
        <div className="flex gap-2">
          <input
            type="number"
            value={montoGasto}
            onChange={(e) => setMontoGasto(e.target.value)}
            placeholder="$0"
            className="flex-1 text-center border border-gray-200 rounded-lg p-2 text-lg font-bold"
          />
          <button
            onClick={registrarGasto}
            disabled={guardandoGasto}
            className="px-4 bg-red-500 text-white rounded-lg font-bold disabled:opacity-50"
          >
            {guardandoGasto ? "..." : "OK"}
          </button>
        </div>
        <p className="text-center text-sm mt-2 font-medium text-red-600">
          Gastos hoy: ${gastosHoy.toLocaleString("es-MX")}
        </p>
      </div>

    </div>
  );
}