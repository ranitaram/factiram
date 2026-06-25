"use client";

import { useRef, useState } from "react";

type ProductoMini = { id: string; nombre: string; unidad: string };

export default function BuscadorProducto({
  productos,
  value,
  onChange,
}: {
  productos: ProductoMini[];
  value: string;
  onChange: (id: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [abierto, setAbierto] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const seleccionado = productos.find((p) => p.id === value);

  const filtrados = productos
    .filter((p) => {
      if (!query.trim()) return true;
      const q = query.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const nom = p.nombre.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      return nom.includes(q);
    })
    .sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));

  function seleccionar(id: string) {
    const p = productos.find((x) => x.id === id);
    if (p) {
      setQuery("");
      onChange(id);
    }
    setAbierto(false);
  }

  return (
    <div ref={ref} className="relative">
      <input
        value={seleccionado && !abierto && !query ? `${seleccionado.nombre} (${seleccionado.unidad})` : query}
        onChange={(e) => {
          setQuery(e.target.value);
          if (e.target.value && !abierto) setAbierto(true);
          if (!e.target.value) onChange("");
        }}
        onFocus={() => {
          if (productos.length > 0) {
            setQuery("");
            setAbierto(true);
          }
        }}
        onBlur={() => {
          setTimeout(() => {
            setAbierto(false);
            if (!seleccionado) setQuery("");
          }, 150);
        }}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            setAbierto(false);
            if (!seleccionado) setQuery("");
          }
        }}
        placeholder="Buscar producto…"
        className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-300"
      />

      {abierto && filtrados.length > 0 && (
        <div className="absolute z-20 top-full mt-1 left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-lg max-h-40 overflow-y-auto">
          {filtrados.map((p) => (
            <button
              key={p.id}
              type="button"
              onMouseDown={() => seleccionar(p.id)}
              className={`w-full text-left px-3 py-2.5 text-sm hover:bg-blue-50 transition-colors ${
                p.id === value ? "bg-blue-50 font-bold text-blue-700" : "text-gray-800"
              }`}
            >
              <span>{p.nombre}</span>
              <span className="text-gray-400 ml-1 text-[10px]">({p.unidad})</span>
            </button>
          ))}
        </div>
      )}

      {abierto && query.trim() && filtrados.length === 0 && (
        <div className="absolute z-20 top-full mt-1 left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-lg p-3 text-sm text-gray-400 text-center">
          Sin resultados
        </div>
      )}
    </div>
  );
}
