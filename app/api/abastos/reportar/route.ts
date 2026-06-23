import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { getSesion } from "@/lib/factiram-session";
import { validarAcceso } from "@/lib/factiram-access";
import { trackEvent } from "@/lib/abastos-track";

export async function HEAD() {
  const sesion = await getSesion();
  if (!sesion) return new Response(null, { status: 401 });

  const suscripcion = await prisma.suscripcion.findUnique({
    where: { negocioId: sesion.negocioId },
  });
  if (!suscripcion) return new Response(null, { status: 403 });

  const acceso = validarAcceso(suscripcion);
  if (acceso.estado !== "ACTIVO" && acceso.estado !== "TRIAL") {
    return new Response(null, { status: 403 });
  }

  return new Response(null, { status: 204 });
}

export async function POST(req: Request) {
  const sesion = await getSesion();
  if (!sesion) {
    return NextResponse.json({ error: "No autorizado. Inicia sesión como dueño o cajero." }, { status: 401 });
  }

  const suscripcion = await prisma.suscripcion.findUnique({
    where: { negocioId: sesion.negocioId },
  });
  if (!suscripcion) {
    return NextResponse.json({ error: "Negocio sin suscripción" }, { status: 403 });
  }
  const acceso = validarAcceso(suscripcion);
  if (acceso.estado !== "ACTIVO" && acceso.estado !== "TRIAL") {
    return NextResponse.json({ error: "Tu suscripción no está activa" }, { status: 403 });
  }

  let body: { productoId?: string; proveedorId?: string; precio?: unknown; unidad?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  try {
    const { productoId, proveedorId, precio, unidad } = body;
    if (!productoId || !proveedorId || precio == null || !unidad) {
      return NextResponse.json({ error: "Faltan campos requeridos (productoId, proveedorId, precio, unidad)" }, { status: 400 });
    }

    const precioNum = Number(precio);
    if (isNaN(precioNum) || precioNum <= 0) {
      return NextResponse.json({ error: "Precio inválido" }, { status: 400 });
    }

    const [producto, proveedor] = await Promise.all([
      prisma.abastosProducto.findUnique({ where: { id: productoId as string }, select: { id: true } }),
      prisma.abastosProveedor.findUnique({ where: { id: proveedorId as string }, select: { id: true } }),
    ]);

    if (!producto) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
    }
    if (!proveedor) {
      return NextResponse.json({ error: "Proveedor no encontrado" }, { status: 404 });
    }

    const registro = await prisma.abastosProductoPrecio.create({
      data: {
        productoId: productoId as string,
        proveedorId: proveedorId as string,
        precio: precioNum,
        unidad: unidad as string,
        verificado: false,
        negocioId: sesion.negocioId,
      },
    });

    trackEvent("reportar", { productoId: productoId as string, proveedorId: proveedorId as string });

    return NextResponse.json({ registro, mensaje: "Precio reportado. Queda pendiente de verificación por el administrador." });
  } catch (e: unknown) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2003") {
      return NextResponse.json({ error: "Producto o proveedor no existe" }, { status: 404 });
    }
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
