import prisma from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { validarAcceso, getMensajeBloqueo } from "@/lib/factiram-access";
import { getSesion } from "@/lib/factiram-session";
import VistaCajero from "@/components/VistaCajero";
import DashboardDueno from "@/app/[slug]/components/DashboardDueno";

export default async function NegocioPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!slug) return <div>Error: slug no válido</div>;

  const negocio = await prisma.negocio.findUnique({
    where: { slugUrl: slug },
    include: { suscripcion: true },
  });

  if (!negocio) notFound();
  if (!negocio.suscripcion) return <div>Negocio sin suscripción activa.</div>;

  // ── Negocio bloqueado manualmente desde admin ──
  if (!negocio.activo) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 text-center shadow-sm max-w-sm">
          <p className="text-2xl font-bold text-gray-800 mb-2">Acceso pausado.</p>
          <p className="text-gray-500">Contacta a tu asesor para reactivar tu cuenta.</p>
        </div>
      </div>
    );
  }

  // ── Validación de suscripción ──
  const resultado = validarAcceso({
    setupPagado: negocio.suscripcion.setupPagado,
    trialStartedAt: negocio.suscripcion.trialStartedAt,
    proximoPagoAt: negocio.suscripcion.proximoPagoAt,
  });

  if (resultado.estado === "BLOQUEADO") {
    const msg = getMensajeBloqueo(resultado.causa);
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 text-center shadow-sm max-w-sm">
          <p className="text-2xl font-bold text-gray-800 mb-2">{msg.titulo}</p>
          <p className="text-gray-500">{msg.subtitulo}</p>
        </div>
      </div>
    );
  }

  // ── Sesión por clave ──
  const sesion = await getSesion();
  if (!sesion || sesion.negocioId !== negocio.id) {
    redirect(`/${slug}/login`);
  }

  const esTrial = resultado.estado === "TRIAL";

  const [productos, costosFijos] = await Promise.all([
    prisma.producto.findMany({
      where: { negocioId: negocio.id, activo: true },
    }),
    prisma.costoFijo.findMany({
      where: { negocioId: negocio.id },
    }),
  ]);

  const productosInput = productos.map((p) => ({
    id: p.id,
    nombre: p.nombre,
    costoCompra: Number(p.costoCompra),
    precioVenta: Number(p.precioVenta),
    piezasDia: Number(p.piezasDia),
  }));

  const costosInput = costosFijos.map((c) => ({
    categoria: c.categoria,
    monto: Number(c.monto),
  }));

  const sharedProps = {
    negocioId: negocio.id,
    negocioNombre: negocio.nombre,
    slug,
    esTrial,
    data: {
      productos: productosInput,
      costosFijos: costosInput,
      diasLaborales: negocio.diasLaborales,
      inversionMercancia: Number(negocio.inversionMercancia),
    },
  };

  // El rol de la sesión decide qué vista se renderiza
  if (sesion.rol === "DUENO") {
    return <DashboardDueno {...sharedProps} />;
  }
  return <VistaCajero {...sharedProps} />;
}
