import { Metadata } from "next";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { Store, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Precios de Insumos en Tepic | Comparador de Proveedores | FACTIRAM",
  description: "Consulta y compara los precios de más de 100 insumos entre los principales proveedores de Tepic. Encuentra dónde comprar más barato.",
  openGraph: {
    title: "Precios de Insumos en Tepic | Comparador de Proveedores | FACTIRAM",
    description: "Consulta y compara los precios de insumos entre los principales proveedores de Tepic.",
    siteName: "FACTIRAM",
    locale: "es_MX",
    type: "website",
  },
};

type ProductoConPrecio = {
  slug: string;
  nombre: string;
  unidad: string;
  categoria: string;
  precioMinimo: number | null;
  proveedorMasBarato: string | null;
};

async function obtenerProductos(): Promise<ProductoConPrecio[]> {
  const productos = await prisma.abastosProducto.findMany({
    where: { activo: true },
    select: {
      slug: true,
      nombre: true,
      unidad: true,
      categoria: true,
      precios: {
        where: { verificado: true, proveedor: { activo: true } },
        orderBy: { precio: "asc" },
        take: 1,
        select: {
          precio: true,
          proveedor: { select: { nombre: true } },
        },
      },
    },
  });

  return productos
    .map((p) => ({
      slug: p.slug,
      nombre: p.nombre,
      unidad: p.unidad,
      categoria: p.categoria,
      precioMinimo: p.precios[0] ? Number(p.precios[0].precio) : null,
      proveedorMasBarato: p.precios[0]?.proveedor.nombre ?? null,
    }))
    .sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
}

export default async function PreciosIndexPage() {
  const productos = await obtenerProductos();

  const categorias = [...new Set(productos.map((p) => p.categoria))].sort();

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
          <Store className="w-3.5 h-3.5" />
          Comparador de precios
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-midnight uppercase italic tracking-tighter">
          Precios de Insumos en Tepic
        </h1>
        <p className="text-gray-500 text-sm mt-2 leading-relaxed max-w-2xl">
          Consulta el precio actualizado de cada insumo entre los principales proveedores de Tepic.
          Cada producto tiene su propia página con la comparativa completa.
        </p>
      </div>

      {categorias.map((cat) => {
        const items = productos.filter((p) => p.categoria === cat);
        return (
          <div key={cat} className="mb-8">
            <h2 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">{cat}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {items.map((p) => (
                <Link
                  key={p.slug}
                  href={`/precios/${p.slug}`}
                  className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all border border-transparent hover:border-emerald-200 group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-midnight group-hover:text-emerald-700 transition-colors text-sm">
                        {p.nombre}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        {p.precioMinimo !== null
                          ? `Desde $${p.precioMinimo.toFixed(2)} / ${p.unidad}`
                          : "Sin precio registrado"}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-emerald-500 transition-colors shrink-0" />
                  </div>
                  {p.precioMinimo !== null && p.proveedorMasBarato && (
                    <p className="text-[10px] text-gray-400 mt-2 pt-2 border-t border-gray-50">
                      Mejor precio en <span className="font-bold text-emerald-600">{p.proveedorMasBarato}</span>
                    </p>
                  )}
                </Link>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
