"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { ruta: "/panel/abastos/buscar", label: "Buscar" },
  { ruta: "/panel/abastos/lista", label: "Mi Lista" },
  { ruta: "/panel/abastos/comparador", label: "Comparador" },
  { ruta: "/panel/abastos/historial", label: "Historial" },
  { ruta: "/panel/abastos/reportar", label: "Reportar" },
];

export default function AbastosLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-midnight">Abastos</h1>
        <p className="text-sm text-slate-soft mt-1">
          Compara precios de insumos entre proveedores locales
        </p>
      </div>

      <div className="flex gap-1 mb-8 bg-gray-100 rounded-xl p-1 overflow-x-auto">
        {TABS.map((t) => {
          const activo = pathname === t.ruta;
          return (
            <Link
              key={t.ruta}
              href={t.ruta}
              className={`flex-1 py-2.5 px-3 rounded-lg text-sm font-bold text-center whitespace-nowrap transition-colors ${
                activo
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {t.label}
            </Link>
          );
        })}
      </div>

      {children}
    </div>
  );
}
