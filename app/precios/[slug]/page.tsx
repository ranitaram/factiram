import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { ArrowRight, Clock, Store } from "lucide-react";
import CtaGanancias from "@/components/CtaGanancias";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const productos = await prisma.abastosProducto.findMany({
    where: { activo: true },
    select: { slug: true },
  });
  return productos.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const producto = await prisma.abastosProducto.findUnique({
    where: { slug },
    select: { nombre: true, activo: true },
  });
  if (!producto || !producto.activo) return {};

  const title = `Precio del ${producto.nombre} en Tepic | Comparador de Proveedores | FACTIRAM`;
  const description = `Compara el precio del ${producto.nombre} entre los principales proveedores de Tepic. Encuentra dónde comprar más barato en tiempo real.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      siteName: "FACTIRAM",
      locale: "es_MX",
      type: "website",
    },
  };
}

export const revalidate = 3600;

type PrecioConProveedor = {
  proveedorId: string;
  proveedorNombre: string;
  telefono: string | null;
  precio: number;
  unidad: string;
  actualizado: Date;
};

async function obtenerPrecios(productoId: string): Promise<{
  precios: PrecioConProveedor[];
  ultimaActualizacion: Date | null;
}> {
  const rows = await prisma.abastosProductoPrecio.findMany({
    where: {
      productoId,
      verificado: true,
      proveedor: { activo: true },
    },
    select: {
      proveedorId: true,
      precio: true,
      unidad: true,
      createdAt: true,
      proveedor: { select: { nombre: true, telefono: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const vistos = new Set<string>();
  const precios: PrecioConProveedor[] = [];
  let ultimaActualizacion: Date | null = null;

  for (const r of rows) {
    const key = r.proveedorId;
    if (vistos.has(key)) continue;
    vistos.add(key);
    precios.push({
      proveedorId: r.proveedorId,
      proveedorNombre: r.proveedor.nombre,
      telefono: r.proveedor.telefono,
      precio: Number(r.precio),
      unidad: r.unidad,
      actualizado: r.createdAt,
    });
    if (!ultimaActualizacion || r.createdAt > ultimaActualizacion) {
      ultimaActualizacion = r.createdAt;
    }
  }

  precios.sort((a, b) => a.precio - b.precio);

  return { precios, ultimaActualizacion };
}

function formatearFecha(d: Date): string {
  return d.toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" });
}

function formatearHora(d: Date): string {
  const h = d.getHours();
  const ampm = h >= 12 ? "pm" : "am";
  const hora12 = h % 12 || 12;
  return `${hora12} ${ampm}`;
}

export default async function PrecioProductoPage({ params }: Props) {
  const { slug } = await params;

  const producto = await prisma.abastosProducto.findUnique({
    where: { slug },
    select: { id: true, nombre: true, unidad: true, activo: true },
  });

  if (!producto || !producto.activo) notFound();

  const { precios, ultimaActualizacion } = await obtenerPrecios(producto.id);

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
          <Store className="w-3.5 h-3.5" />
          Comparador de precios
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-midnight uppercase italic tracking-tighter">
          Precio del {producto.nombre} en Tepic
        </h1>
        <p className="text-gray-500 text-sm mt-2 leading-relaxed">
          Compara el precio del {producto.nombre} entre los principales proveedores de Tepic y descubre dónde comprar más barato.
        </p>
      </div>

      {ultimaActualizacion && (
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 mb-4">
          <Clock className="w-3 h-3" />
          Precios actualizados al {formatearFecha(ultimaActualizacion)} a las {formatearHora(ultimaActualizacion)}
        </div>
      )}

      {precios.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
          <p className="text-gray-400 font-bold text-sm">
            Aún no hay precios registrados para {producto.nombre}.
          </p>
          <p className="text-gray-300 text-xs mt-1">
            Vuelve pronto o usa el buscador para ver productos disponibles.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left p-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Proveedor</th>
                  <th className="text-right p-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Precio</th>
                  <th className="text-right p-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Unidad</th>
                  <th className="text-right p-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Actualizado</th>
                </tr>
              </thead>
              <tbody>
                {precios.map((p, i) => {
                  const waHref = p.telefono
                    ? `https://wa.me/${p.telefono.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(`Hola, vi el precio del ${producto.nombre} en factiram.com y me interesa comprar este producto`)}`
                    : null;
                  return (<tr key={p.proveedorId} className={`border-b border-gray-50 ${i === 0 ? "bg-emerald-50/50" : ""}`}>
                    <td className="p-3 font-bold text-midnight">
                      {waHref ? (
                        <a href={waHref} target="_blank" rel="noopener noreferrer" className="hover:text-emerald-600 transition-colors">
                          {p.proveedorNombre}
                        </a>
                      ) : (
                        p.proveedorNombre
                      )}
                      {i === 0 && (
                        <span className="ml-2 text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                          Más barato
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-right font-black text-lg text-midnight">
                      {waHref ? (
                        <a href={waHref} target="_blank" rel="noopener noreferrer" className="hover:text-emerald-600 transition-colors">
                          ${p.precio.toFixed(2)}
                        </a>
                      ) : (
                        <>${p.precio.toFixed(2)}</>
                      )}
                    </td>
                    <td className="p-3 text-right text-gray-400 text-xs font-bold">
                      / {p.unidad}
                    </td>
                    <td className="p-3 text-right text-gray-400 text-[10px] whitespace-nowrap">
                      {formatearFecha(p.actualizado)}
                    </td>
                  </tr>);
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {precios.length > 1 && (
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-2xl p-5 shadow-sm">
          <p className="text-sm text-blue-800 font-bold">
            Ahorro potencial
          </p>
          <p className="text-2xl font-black text-blue-700 mt-1">
            ${(precios[precios.length - 1].precio - precios[0].precio).toFixed(2)}
            <span className="text-sm font-bold text-blue-500 ml-1">de diferencia</span>
          </p>
          <p className="text-xs text-blue-600 mt-1">
            Entre el precio más alto y el más bajo de {producto.nombre}.
          </p>
        </div>
      )}

      <div className="mt-8 text-center">
        <Link
          href="/panel/abastos/buscar"
          className="inline-flex items-center gap-2 bg-midnight text-white px-8 py-4 rounded-xl font-black uppercase text-xs tracking-wider hover:bg-slate-800 transition-all shadow-lg"
        >
          Comparar todos los productos <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="mt-8">
        <CtaGanancias productoNombre={producto.nombre} />
      </div>
    </div>
  );
}
