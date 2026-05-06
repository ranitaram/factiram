import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { setSesion, clearSesion } from "@/lib/factiram-session";

export async function POST(req: Request) {
  try {
    const { slug, clave } = await req.json();
    if (typeof slug !== "string" || typeof clave !== "string") {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
    }
    if (!/^\d{4}$/.test(clave)) {
      return NextResponse.json({ error: "La clave debe tener 4 dígitos" }, { status: 400 });
    }

    const negocio = await prisma.negocio.findUnique({
      where: { slugUrl: slug },
      include: { usuarios: true },
    });

    if (!negocio) {
      return NextResponse.json({ error: "Negocio no encontrado" }, { status: 404 });
    }

    const usuario = negocio.usuarios.find((u) => u.clave === clave);
    if (!usuario) {
      return NextResponse.json({ error: "Clave incorrecta" }, { status: 401 });
    }

    await setSesion({ negocioId: negocio.id, rol: usuario.rol });
    return NextResponse.json({ ok: true, rol: usuario.rol });
  } catch {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function DELETE() {
  await clearSesion();
  return NextResponse.json({ ok: true });
}
