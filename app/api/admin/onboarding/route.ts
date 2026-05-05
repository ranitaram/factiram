import { NextResponse } from "next/server";
import { crearNegocio } from "@/lib/onboarding";

// Protección simple con clave de admin
const ADMIN_SECRET = process.env.ADMIN_SECRET;

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("x-admin-secret");
    if (authHeader !== ADMIN_SECRET) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await req.json();
    const resultado = await crearNegocio(body);

    return NextResponse.json(resultado);
  } catch (error: unknown) {
    const mensaje = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json({ error: mensaje }, { status: 500 });
  }
}