import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { validarAcceso, getMensajeBloqueo } from "@/lib/factiram-access";
import VistaCajero from "@/components/VistaCajero";
import DashboardDueno from "@/app/[slug]/components/DashboardDueno";

// Por ahora el modo se controla con un query param: ?modo=dueno
// En el siguiente paso lo reemplazamos con autenticación real
export default async function NegocioPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ modo?: string }>;
}) {
  const { slug } = await params;
  const { modo } = await searchParams;

  if (!slug) return <div>Error: slug no válido</div>;

  const negocio = await prisma.negocio.findUnique({
    where: { slugUrl: slug },
    include: { suscripcion: true },
  });

  if (!negocio) notFound();
  if (!negocio.suscripcion) return <div>Negocio sin suscripción activa.</div>;

  // ── Validación de acceso ──
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

  const esTrial = resultado.estado === "TRIAL";

  // ── Datos reales de BD ──
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
    piezasDia: Number(p.piezasDia), // ← valor real de BD
  }));

  const costosInput = costosFijos.map((c) => ({
    categoria: c.categoria,
    monto: Number(c.monto),
  }));

  const sharedProps = {
    negocioId: negocio.id,
    negocioNombre: negocio.nombre,
    esTrial,
    data: {
      productos: productosInput,
      costosFijos: costosInput,
      diasLaborales: negocio.diasLaborales,
      inversionMercancia: Number(negocio.inversionMercancia),
    },
  };

  // ── Detectar vista ──
  // Temporal: ?modo=dueno → DashboardDueno, cualquier otra cosa → VistaCajero
  // Próximo paso: reemplazar con autenticación real por rol
  if (modo === "dueno") {
    return <DashboardDueno {...sharedProps} />;
  }

  return <VistaCajero {...sharedProps} />;
}