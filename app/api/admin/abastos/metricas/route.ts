import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getProductosDesactualizados } from "@/lib/abastos-queries";

export async function GET() {
  try {
    const ahora = new Date();
    const inicioHoy = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
    const inicioSemana = new Date(inicioHoy.getTime() - 7 * 24 * 60 * 60 * 1000);
    const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);

    const [eventosHoy, eventosSemana, totalProductos, preciosVerificados, ultimosPrecios, desactualizados, whatsappEventos] =
      await Promise.all([
        prisma.abastosEvento.groupBy({
          by: ["tipo"],
          where: { createdAt: { gte: inicioHoy } },
          _count: true,
        }),
        prisma.abastosEvento.groupBy({
          by: ["tipo"],
          where: { createdAt: { gte: inicioSemana } },
          _count: true,
        }),
        prisma.abastosProducto.count({ where: { activo: true } }),
        prisma.abastosProductoPrecio.findMany({
          where: { verificado: true, proveedor: { activo: true } },
          select: { productoId: true },
          distinct: ["productoId"],
        }),
        prisma.abastosProductoPrecio.findMany({
          where: { verificado: true, proveedor: { activo: true } },
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { createdAt: true },
        }),
        getProductosDesactualizados(14),
        prisma.abastosEvento.findMany({
          where: { tipo: "contactar_whatsapp" },
          select: { metadata: true, createdAt: true },
        }),
      ]);

    const productosConPrecio = preciosVerificados.length;
    const cobertura = totalProductos > 0 ? Math.round((productosConPrecio / totalProductos) * 100) : 0;

    const productosSinPrecio = await prisma.abastosProducto.findMany({
      where: {
        activo: true,
        id: { notIn: preciosVerificados.map((p) => p.productoId) },
      },
      select: { nombre: true },
      orderBy: { nombre: "asc" },
    });

    const hoyMap = Object.fromEntries(eventosHoy.map((e) => [e.tipo, e._count]));
    const semanaMap = Object.fromEntries(eventosSemana.map((e) => [e.tipo, e._count]));

    const whatsappMap = new Map<string, { hoy: number; semana: number; mes: number }>();
    for (const e of whatsappEventos) {
      const nombre = String((e.metadata as Record<string, unknown> | null)?.proveedorNombre ?? "Desconocido");
      const acc = whatsappMap.get(nombre) ?? { hoy: 0, semana: 0, mes: 0 };
      if (e.createdAt >= inicioHoy) acc.hoy++;
      if (e.createdAt >= inicioSemana) acc.semana++;
      if (e.createdAt >= inicioMes) acc.mes++;
      whatsappMap.set(nombre, acc);
    }

    const whatsappPorProveedor = Array.from(whatsappMap.entries())
      .map(([proveedorNombre, counts]) => ({ proveedorNombre, ...counts }))
      .sort((a, b) => b.semana - a.semana);

    return NextResponse.json({
      hoy: {
        busquedas: hoyMap["busqueda"] ?? 0,
        agregadosLista: hoyMap["agregar_lista"] ?? 0,
        comparaciones: hoyMap["comparar"] ?? 0,
        reportes: hoyMap["reportar"] ?? 0,
        contactarWhatsapp: hoyMap["contactar_whatsapp"] ?? 0,
        total: eventosHoy.reduce((s, e) => s + e._count, 0),
      },
      semana: {
        busquedas: semanaMap["busqueda"] ?? 0,
        agregadosLista: semanaMap["agregar_lista"] ?? 0,
        comparaciones: semanaMap["comparar"] ?? 0,
        reportes: semanaMap["reportar"] ?? 0,
        contactarWhatsapp: semanaMap["contactar_whatsapp"] ?? 0,
        total: eventosSemana.reduce((s, e) => s + e._count, 0),
      },
      cobertura: {
        porcentaje: cobertura,
        productosConPrecio,
        totalProductos,
      },
      productosSinPrecio: productosSinPrecio.map((p) => p.nombre),
      productosDesactualizados: desactualizados,
      whatsappPorProveedor,
      umbralDias: 14,
    });
  } catch {
    return NextResponse.json({ error: "Error al obtener métricas" }, { status: 500 });
  }
}
