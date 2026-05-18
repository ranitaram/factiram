import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/factiram-session";
import {
  activarMensualidad,
  bloquearNegocio,
  reactivarNegocio,
  eliminarNegocio,
} from "@/lib/onboarding";

type Accion = "activar" | "bloquear" | "reactivar";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const { accion } = (await req.json()) as { accion: Accion };

  try {
    if (accion === "activar") {
      const r = await activarMensualidad(id);
      return NextResponse.json(r);
    }
    if (accion === "bloquear") {
      const r = await bloquearNegocio(id);
      return NextResponse.json(r);
    }
    if (accion === "reactivar") {
      const r = await reactivarNegocio(id);
      return NextResponse.json(r);
    }
    return NextResponse.json({ error: "Acción inválida" }, { status: 400 });
  } catch (error: unknown) {
    const mensaje = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json({ error: mensaje }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const r = await eliminarNegocio(id);
    return NextResponse.json(r);
  } catch (error: unknown) {
    const mensaje = error instanceof Error ? error.message : "Error desconocido";
    const status = mensaje === "Negocio no encontrado" ? 404 : 500;
    return NextResponse.json({ error: mensaje }, { status });
  }
}
