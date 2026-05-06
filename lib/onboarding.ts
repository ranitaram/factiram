import prisma from "@/lib/prisma";

type NuevoClienteConfig = {
  nombreNegocio: string;
  slugUrl: string;
  diasLaborales?: number;
  inversionMercancia?: number;
  productos?: {
    nombre: string;
    costoCompra: number;
    precioVenta: number;
    piezasDia: number;
  }[];
  costosFijos?: {
    categoria: "RENTA" | "LUZ_AGUA" | "INTERNET" | "SUELDOS" | "PUBLICIDAD" | "OTROS";
    monto: number;
  }[];
};

const CATEGORIAS_BASE = [
  "RENTA",
  "LUZ_AGUA",
  "INTERNET",
  "SUELDOS",
  "PUBLICIDAD",
  "OTROS",
] as const;

function generarClave(): string {
  return String(Math.floor(1000 + Math.random() * 9000));
}

function slugSeguro(slug: string): string {
  return slug
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function crearNegocio(config: NuevoClienteConfig) {
  const slug = slugSeguro(config.slugUrl);
  if (!slug) throw new Error("Slug inválido");
  if (!config.nombreNegocio?.trim()) throw new Error("Nombre requerido");

  const claveDueno = generarClave();
  const claveCajero = generarClave();

  const productosBase =
    config.productos && config.productos.length > 0
      ? config.productos
      : [
          { nombre: "Producto A", costoCompra: 0, precioVenta: 0, piezasDia: 0 },
        ];

  const costosBase =
    config.costosFijos && config.costosFijos.length > 0
      ? config.costosFijos
      : CATEGORIAS_BASE.map((c) => ({ categoria: c, monto: 0 }));

  const result = await prisma.$transaction(async (tx) => {
    const negocio = await tx.negocio.create({
      data: {
        nombre: config.nombreNegocio.trim(),
        slugUrl: slug,
        diasLaborales: config.diasLaborales ?? 26,
        inversionMercancia: config.inversionMercancia ?? 0,
      },
    });

    await tx.suscripcion.create({
      data: {
        negocioId: negocio.id,
        trialStartedAt: new Date(),
        setupPagado: false,
        estadoMensual: "TRIAL",
      },
    });

    await tx.producto.createMany({
      data: productosBase.map((p) => ({
        negocioId: negocio.id,
        nombre: p.nombre,
        costoCompra: p.costoCompra,
        precioVenta: p.precioVenta,
        piezasDia: p.piezasDia,
        activo: true,
      })),
    });

    await tx.costoFijo.createMany({
      data: costosBase.map((c) => ({
        negocioId: negocio.id,
        categoria: c.categoria,
        monto: c.monto,
        updatedAt: new Date(),
      })),
    });

    await tx.usuarioNegocio.createMany({
      data: [
        { negocioId: negocio.id, rol: "DUENO", clave: claveDueno },
        { negocioId: negocio.id, rol: "CAJERO", clave: claveCajero },
      ],
    });

    return negocio;
  });

  return {
    negocioId: result.id,
    nombre: result.nombre,
    slug: result.slugUrl,
    linkDueno: `/${result.slugUrl}?modo=dueno`,
    linkCajero: `/${result.slugUrl}`,
    claveDueno,
    claveCajero,
  };
}

export async function activarMensualidad(negocioId: string) {
  const proximoPagoAt = new Date();
  proximoPagoAt.setDate(proximoPagoAt.getDate() + 30);

  await prisma.suscripcion.update({
    where: { negocioId },
    data: {
      setupPagado: true,
      proximoPagoAt,
      estadoMensual: "VIGENTE",
    },
  });

  return { ok: true, proximoPagoAt };
}

export async function bloquearNegocio(negocioId: string) {
  await prisma.negocio.update({
    where: { id: negocioId },
    data: { activo: false },
  });
  return { ok: true };
}

export async function reactivarNegocio(negocioId: string) {
  await prisma.negocio.update({
    where: { id: negocioId },
    data: { activo: true },
  });
  return { ok: true };
}
