import { NextResponse } from "next/server";
import { setSesionAdmin, clearSesionAdmin, verificarAdminSecret } from "@/lib/factiram-session";

const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000;
const intentos = new Map<string, { count: number; bloqueadoHasta: number | null }>();

function getIp(req: Request): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}

function cleanExpired() {
  const now = Date.now();
  for (const [ip, data] of intentos) {
    if (data.bloqueadoHasta && now >= data.bloqueadoHasta) {
      intentos.delete(ip);
    }
  }
}

export async function POST(req: Request) {
  try {
    const ip = getIp(req);
    cleanExpired();

    const registro = intentos.get(ip);

    if (registro?.bloqueadoHasta) {
      const restante = Math.ceil((registro.bloqueadoHasta - Date.now()) / 1000);
      if (restante > 0) {
        return NextResponse.json(
          { error: `Demasiados intentos. Intenta en ${restante} segundos`, retryAfter: restante },
          { status: 429 },
        );
      }
      intentos.delete(ip);
    }

    const { secret } = await req.json();

    if (!verificarAdminSecret(secret)) {
      const nuevo = (registro?.count ?? 0) + 1;
      const bloqueadoHasta = nuevo >= RATE_LIMIT_MAX ? Date.now() + RATE_LIMIT_WINDOW_MS : null;

      intentos.set(ip, { count: nuevo, bloqueadoHasta });

      console.warn(
        `[ADMIN AUTH] Intento fallido #${nuevo} desde IP ${ip} — ${new Date().toISOString()}${bloqueadoHasta ? " (BLOQUEADO 5 min)" : ""}`,
      );

      return NextResponse.json(
        { error: "Clave incorrecta", intentos: nuevo, maxIntentos: RATE_LIMIT_MAX },
        { status: 401 },
      );
    }

    intentos.delete(ip);
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
