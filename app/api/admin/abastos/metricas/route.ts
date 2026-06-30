import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getProductosDesactualizados } from "@/lib/abastos-queries";

export async function GET() {
  try {
    const ahora = new Date();
    const inicioHoy = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
    const inicioSemana = new Date(inicioHoy.getTime() - 7 * 24 * 60 * 60 * 1000);
    const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);

    const [eventosHoy, eventosSemana, totalProductos, preciosVerificados, ultimosPrecios, desactualizados, whatsappEventos, ultimosEventos, visitantesHoy, visitantesSemana, visitantesMes, sesionesHoy, sesionesSemana, sesionesMes] =
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
        prisma.abastosEvento.findMany({
          orderBy: { createdAt: "desc" },
          take: 15,
          select: { id: true, tipo: true, metadata: true, createdAt: true },
        }),
        prisma.abastosEvento.groupBy({
          by: ["visitorId"],
          where: { createdAt: { gte: inicioHoy }, visitorId: { not: null } },
          _count: { visitorId: true },
        }),
        prisma.abastosEvento.groupBy({
          by: ["visitorId"],
          where: { createdAt: { gte: inicioSemana }, visitorId: { not: null } },
          _count: { visitorId: true },
        }),
        prisma.abastosEvento.groupBy({
          by: ["visitorId"],
          where: { createdAt: { gte: inicioMes }, visitorId: { not: null } },
          _count: { visitorId: true },
        }),
        prisma.abastosEvento.groupBy({
          by: ["sessionId"],
          where: { createdAt: { gte: inicioHoy }, sessionId: { not: null } },
          _count: { sessionId: true },
        }),
        prisma.abastosEvento.groupBy({
          by: ["sessionId"],
          where: { createdAt: { gte: inicioSemana }, sessionId: { not: null } },
          _count: { sessionId: true },
        }),
        prisma.abastosEvento.groupBy({
          by: ["sessionId"],
          where: { createdAt: { gte: inicioMes }, sessionId: { not: null } },
          _count: { sessionId: true },
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
      visitantes: {
        hoy: visitantesHoy.length,
        semana: visitantesSemana.length,
        mes: visitantesMes.length,
      },
      sesiones: {
        hoy: sesionesHoy.length,
        semana: sesionesSemana.length,
        mes: sesionesMes.length,
      },
      whatsappPorProveedor,
      ultimosEventos: ultimosEventos.map((e) => ({
        id: e.id,
        tipo: e.tipo,
        metadata: e.metadata,
        fecha: e.createdAt.toISOString(),
      })),
      umbralDias: 14,
    });
  } catch {
    return NextResponse.json({ error: "Error al obtener métricas" }, { status: 500 });
  }
}
