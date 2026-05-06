import { NextResponse } from "next/server";
import { setSesionAdmin, clearSesionAdmin, verificarAdminSecret } from "@/lib/factiram-session";

export async function POST(req: Request) {
  try {
    const { secret } = await req.json();
    if (!verificarAdminSecret(secret)) {
      return NextResponse.json({ error: "Clave incorrecta" }, { status: 401 });
    }
    await setSesionAdmin();
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function DELETE() {
  await clearSesionAdmin();
  return NextResponse.json({ ok: true });
}
