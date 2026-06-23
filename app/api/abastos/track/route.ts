import { NextResponse } from "next/server";
import { trackEvent } from "@/lib/abastos-track";

export async function POST(req: Request) {
  try {
    const { tipo, metadata } = await req.json();
    if (!tipo || typeof tipo !== "string") {
      return NextResponse.json({ error: "Campo 'tipo' requerido" }, { status: 400 });
    }

    await trackEvent(tipo, metadata);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
