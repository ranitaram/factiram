"use client";

import { useState, useEffect, useCallback } from "react";
import {
  calcularFactiram,
  calcularPrediccion,
  type FactiramInput,
} from "@/lib/factiram-engine";

type Props = {
  negocioId: string;
  negocioNombre: string;
  esTrial: boolean;
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
  esTrial,
  data,
}: Props) {
  const [piezasVendidasHoy, setPiezasVendidasHoy] = useState(0);
  const [efectivoHoy, setEfectivoHoy] = useState(0);
  const [guardandoId, setGuardandoId] = useState<string | null>(null);
  const [gastosHoy, setGastosHoy] = useState(0);
  const [montoGasto, setMontoGasto] = useState("");
  const [guardandoGasto, setGuardandoGasto] = useState(false);
  const [horaActual, setHoraActual] = useState(new Date().getHours());

  // Actualizar hora cada minuto para que la predicción sea viva
  useEffect(() => {
    const interval = setInterval(() => {
      setHoraActual(new Date().getHours());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchVentas = useCallback(async () => {
    try {
      const res = await fetch(`/api/ventas/hoy?negocioId=${negocioId}`);
      const json = await res.json();
      setPiezasVendidasHoy(json.piezasVendidasHoy ?? 0);
    } catch (e) {
      console.error("Error al leer ventas", e);
    }
  }, [negocioId]);

  const fetchGastos = useCallback(async () => {
    try {
      const res = await fetch(`/api/gastos/hoy?negocioId=${negocioId}`);
      const json = await res.json();
      setGastosHoy(json.total ?? 0);
    } catch (e) {
      console.error("Error al leer gastos", e);
    }
  }, [negocioId]);

  useEffect(() => {
    fetchVentas();
    fetchGastos();
  }, [fetchVentas, fetchGastos]);

  async function registrarVenta(productoId: string) {
    if (guardandoId) return;
    setGuardandoId(productoId);
    try {
      await fetch("/api/ventas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ negocioId, productoId, cantidad: 1 }),
      });
      await fetchVentas();
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
      await fetchGastos();
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
    efectivoHoy,
    gastosHoy,
  };

  const resultado = sinProductos ? null : calcularFactiram(inputCompleto);
  const prediccion = sinProductos
    ? null
    : calcularPrediccion(inputCompleto, horaActual);

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
  const faltan = Math.max(0, metaDiaria - piezasVendidasHoy);

  const colorPrediccion = {
    BIEN: "border-green-300 bg-green-50 text-green-800",
    RIESGO: "border-yellow-300 bg-yellow-50 text-yellow-800",
    MAL: "border-red-200 bg-red-50 text-red-700",
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-4 max-w-lg mx-auto pb-10">

      {esTrial && (
        <div className="w-full bg-yellow-100 text-yellow-800 p-3 text-center rounded-xl mb-4 font-semibold text-sm">
          ⚠️ Modo prueba activo
        </div>
      )}

      {/* HEADER */}
      <div className="text-center mb-6 w-full">
        <h1 className="text-3xl font-extrabold text-blue-600 tracking-tight">
          FACTIRAM
        </h1>
        <p className="text-gray-500 font-medium text-sm">{negocioNombre}</p>
        <p className="text-gray-400 text-xs capitalize">
          {new Date().toLocaleDateString("es-MX", {
            weekday: "long",
            day: "numeric",
            month: "long",
          })}
        </p>
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
            : `Te faltan ${faltan} piezas para no perder`}
        </p>
      </div>

      {/* PREDICCIÓN DEL DÍA */}
      <div className={`w-full rounded-xl p-4 mb-4 border-2 ${
        colorPrediccion[prediccion!.nivelAlerta]
      }`}>
        <p className="text-xs uppercase font-bold tracking-widest mb-1 text-center">
          Si sigues así hoy terminarás con
        </p>
        <p className="text-2xl font-black text-center">
          {prediccion!.proyeccionPiezas} piezas vendidas
        </p>
        <p className="text-sm font-medium mt-2 text-center">
          {prediccion!.mensajeAlerta}
        </p>
        {prediccion!.nivelAlerta !== "BIEN" && (
          <p className="text-sm font-bold mt-2 text-center">
            Flujo proyectado al cierre:{" "}
            <span className={prediccion!.proyeccionFlujo >= 0 ? "text-green-700" : "text-red-700"}>
              ${Math.round(prediccion!.proyeccionFlujo).toLocaleString("es-MX")}
            </span>
          </p>
        )}
      </div>

      {/* CONTADOR + PRODUCTOS */}
      <div className="w-full bg-white rounded-2xl p-6 shadow-sm mb-4">
        <p className="text-center text-sm text-gray-500 mb-1">
          Piezas vendidas hoy
        </p>
        <p className="text-5xl font-black text-blue-600 text-center mb-2">
          {piezasVendidasHoy}
        </p>
        <p className="text-center text-xs text-gray-400 mb-6">
          Meta: {metaDiaria} piezas para no perder
        </p>

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
          {data.productos.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between bg-gray-50 p-3 rounded-xl border"
            >
              <div>
                <p className="font-bold text-sm">{p.nombre}</p>
                <p className="text-xs text-gray-400">
                  Vendes a ${Number(p.precioVenta).toLocaleString("es-MX")} ·{" "}
                  Ganas ${(Number(p.precioVenta) - Number(p.costoCompra)).toLocaleString("es-MX")}
                </p>
              </div>
              <button
                onClick={() => registrarVenta(p.id)}
                disabled={guardandoId === p.id}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white font-bold text-sm disabled:opacity-50 active:bg-blue-700"
              >
                {guardandoId === p.id ? "..." : "+1"}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* EFECTIVO */}
      <div className="w-full bg-white rounded-2xl p-5 shadow-sm mb-4">
        <p className="text-xs font-bold text-gray-500 uppercase text-center mb-2">
          ¿Cuánto dinero cobraste en efectivo hoy?
        </p>
        <div className="flex items-center justify-center gap-2">
          <span className="text-gray-400 font-bold text-xl">$</span>
          <input
            type="number"
            value={efectivoHoy}
            onChange={(e) => setEfectivoHoy(Number(e.target.value))}
            className="w-36 text-center font-bold text-green-600 text-2xl border border-gray-200 rounded-lg p-2 bg-gray-50"
          />
        </div>
        <p className="text-xs text-gray-400 mt-2 italic text-center">
          Lo que falte se anota como &quot;Dinero que te deben&quot;.
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