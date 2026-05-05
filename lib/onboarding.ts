import prisma from "@/lib/prisma";
import { addDays } from "date-fns";

type NuevoClienteConfig = {
  nombreNegocio: string;
  slugUrl: string;
  diasLaborales: number;
  inversionMercancia: number;
  productos: {
    nombre: string;
    costoCompra: number;
    precioVenta: number;
    piezasDia: number;
  }[];
  costosFijos: {
    categoria: "RENTA" | "LUZ_AGUA" | "INTERNET" | "SUELDOS" | "PUBLICIDAD" | "OTROS";
    monto: number;
  }[];
};

export async function crearNegocio(config: NuevoClienteConfig) {
  return await prisma.$transaction(async (tx) => {
    // 1. Crear negocio
    const negocio = await tx.negocio.create({
      data: {
        nombre: config.nombreNegocio,
        slugUrl: config.slugUrl,
        diasLaborales: config.diasLaborales,
        inversionMercancia: config.inversionMercancia,
      },
    });

    // 2. Crear suscripción en modo trial
    await tx.suscripcion.create({
      data: {
        negocioId: negocio.id,
        trialStartedAt: new Date(),
        setupPagado: false,
        estadoMensual: "TRIAL",
      },
    });

    // 3. Crear productos
    await tx.producto.createMany({
      data: config.productos.map((p) => ({
        negocioId: negocio.id,
        nombre: p.nombre,
        costoCompra: p.costoCompra,
        precioVenta: p.precioVenta,
        piezasDia: p.piezasDia,
        activo: true,
      })),
    });

    // 4. Crear costos fijos
    await tx.costoFijo.createMany({
      data: config.costosFijos.map((c) => ({
        negocioId: negocio.id,
        categoria: c.categoria,
        monto: c.monto,
        updatedAt: new Date(),
      })),
    });

    return {
      negocioId: negocio.id,
      url: `/${config.slugUrl}`,
      nombre: config.nombreNegocio,
    };
  });
}