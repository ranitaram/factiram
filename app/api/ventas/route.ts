import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { negocioId, productoId, cantidad } = body;

    if (!negocioId || !productoId) {
      return NextResponse.json(
        { error: "Datos incompletos" },
        { status: 400 }
      );
    }

    const producto = await prisma.producto.findUnique({
      where: { id: productoId },
    });

    if (!producto) {
      return NextResponse.json(
        { error: "Producto no encontrado" },
        { status: 404 }
      );
    }

    const cantidadFinal = cantidad || 1;

    const total =
      Number(producto.precioVenta) * cantidadFinal;

    // 🔥 NORMALIZAMOS FECHA (CLAVE)
    const ahora = new Date();

   /* const fechaLocal = new Date(
      ahora.getFullYear(),
      ahora.getMonth(),
      ahora.getDate(),
      ahora.getHours(),
      ahora.getMinutes(),
      ahora.getSeconds()
    ); */

    const venta = await prisma.ventaDia.create({
      data: {
        cantidad: cantidadFinal,
        tipo: "EFECTIVO",
        precioUnitario: producto.precioVenta,
        total,

        // 👇 ESTO ES LO IMPORTANTE
       // fecha: fechaLocal,

        negocio: { connect: { id: negocioId } },
        producto: { connect: { id: productoId } },
      },
    });

    return NextResponse.json(venta);
  } catch (error) {
    console.error("Error en POST /api/ventas:", error);
    return NextResponse.json(
      { error: "Error al registrar venta" },
      { status: 500 }
    );
  }
}