"use client";

import { useState, useEffect, useCallback } from "react";
import {
  calcularFactiram,
  calcularPrediccion,
  type FactiramInput,
  type ProductoInput,
} from "@/lib/factiram-engine";

type Props = {
  negocioId: string;
  negocioNombre: string;
  esTrial: boolean;
  data: {
    productos: ProductoInput[];
    costosFijos: FactiramInput["costosFijos"];
    diasLaborales: number;
    inversionMercancia: number;
  };
};

export default function DashboardDueno({
  negocioId,
  negocioNombre,
  esTrial,
  data,
}: Props) {
  const [piezasVendidasHoy, setPiezasVendidasHoy] = useState(0);
  const [efectivoHoy, setEfectivoHoy] = useState(0);
  const [gastosHoy, setGastosHoy] = useState(0);
  const [productos, setProductos] = useState<ProductoInput[]>(data.productos);
  const [horaActual, setHoraActual] = useState(new Date().getHours());

  // ── FETCH ──
  const fetchVentas = useCallback(async () => {
    const res = await fetch(`/api/ventas/hoy?negocioId=${negocioId}`);
    const json = await res.json();
    setPiezasVendidasHoy(json.piezasVendidasHoy ?? 0);
  }, [negocioId]);

  const fetchGastos = useCallback(async () => {
    const res = await fetch(`/api/gastos/hoy?negocioId=${negocioId}`);
    const json = await res.json();
    setGastosHoy(json.total ?? 0);
    setEfectivoHoy(json.efectivo ?? 0);
  }, [negocioId]);

  useEffect(() => {
    fetchVentas();
    fetchGastos();

    const interval = setInterval(() => {
      fetchVentas();
      fetchGastos();
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchVentas, fetchGastos]);

  // ── MOTOR ──
  const input: FactiramInput = {
    productos,
    costosFijos: data.costosFijos,
    diasLaborales: data.diasLaborales,
    piezasVendidasHoy,
    efectivoHoy,
    inversionMercancia: data.inversionMercancia,
    gastosHoy,
  };

  const r = calcularFactiram(input);
  const prediccion = calcularPrediccion(input, horaActual);

  const utilidadRealHoy =
    r.flujoRealHoy - r.totalCostosFijos / data.diasLaborales;

  // ── PRODUCTOS ──
  function actualizarProducto(
    idx: number,
    campo: keyof ProductoInput,
    valor: string | number
  ) {
    setProductos((prev) =>
      prev.map((p, i) => (i === idx ? { ...p, [campo]: valor } : p))
    );
  }

  function agregarProducto() {
    setProductos((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        nombre: "Nuevo",
        costoCompra: 0,
        precioVenta: 0,
        piezasDia: 0,
      },
    ]);
  }

  function eliminarProducto(idx: number) {
    setProductos((prev) => prev.filter((_, i) => i !== idx));
  }

  // ── UI ──
  return (
    <div className="min-h-screen bg-gray-100 p-4 max-w-md mx-auto">

      {/* HEADER */}
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-black text-blue-600">FACTIRAM</h1>
        <p className="text-gray-500">{negocioNombre}</p>
      </div>

      {/* REALIDAD */}
      <div className={`p-5 rounded-2xl mb-4 text-center shadow ${
        utilidadRealHoy >= 0 ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
      }`}>
        <p className="text-xs uppercase font-bold mb-1">Hoy</p>
        <p className="text-4xl font-black">
          ${Math.round(utilidadRealHoy)}
        </p>
        <p className="text-sm">
          {utilidadRealHoy >= 0 ? "Vas ganando dinero" : "Estás perdiendo dinero"}
        </p>
      </div>

      {/* PREDICCIÓN */}
      <div className="bg-white p-4 rounded-xl mb-4 border">
        <p className="text-xs text-gray-500 text-center mb-1">
          Si sigues así
        </p>
        <p className="text-2xl font-bold text-center">
          ${Math.round(prediccion.proyeccionFlujo)}
        </p>
        <p className="text-center text-sm mt-2 text-gray-600">
          {prediccion.mensajeAlerta}
        </p>
      </div>

      {/* PRODUCTOS */}
      <div className="bg-white rounded-xl p-4 shadow">
        <h2 className="font-bold mb-3">Productos</h2>

        <div className="space-y-2">
          {productos.map((p, i) => {
            const ganancia = p.precioVenta - p.costoCompra;

            return (
              <div key={p.id} className="grid grid-cols-5 gap-2 items-center">

                <input
                  className="col-span-2 border rounded p-1 text-sm"
                  value={p.nombre}
                  onChange={(e) =>
                    actualizarProducto(i, "nombre", e.target.value)
                  }
                />

                <input
                  className="border rounded p-1 text-sm text-center"
                  type="number"
                  value={p.costoCompra}
                  onChange={(e) =>
                    actualizarProducto(i, "costoCompra", Number(e.target.value))
                  }
                />

                <input
                  className="border rounded p-1 text-sm text-center"
                  type="number"
                  value={p.precioVenta}
                  onChange={(e) =>
                    actualizarProducto(i, "precioVenta", Number(e.target.value))
                  }
                />

                <div className="text-center text-xs font-bold text-green-600">
                  +{ganancia}
                </div>

                <button
                  onClick={() => eliminarProducto(i)}
                  className="text-red-500 font-bold"
                >
                  ×
                </button>
              </div>
            );
          })}
        </div>

        <button
          onClick={agregarProducto}
          className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg font-bold"
        >
          + Agregar producto
        </button>
      </div>
    </div>
  );
}