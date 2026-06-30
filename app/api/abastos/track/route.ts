import { NextResponse } from "next/server";
import { trackEvent } from "@/lib/abastos-track";

export async function POST(req: Request) {
  try {
    const { tipo, metadata, visitorId, sessionId } = await req.json();
    if (!tipo || typeof tipo !== "string") {
      return NextResponse.json({ error: "Campo 'tipo' requerido" }, { status: 400 });
    }

    await trackEvent(tipo, metadata, visitorId, sessionId);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
