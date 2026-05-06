import crypto from "crypto";
import { cookies } from "next/headers";

const SECRET =
  process.env.FACTIRAM_AUTH_SECRET ||
  process.env.NEXTAUTH_SECRET ||
  "factiram-dev-secret-change-me";

const COOKIE_NAME = "factiram_session";
const ADMIN_COOKIE = "factiram_admin";

export type Sesion = { negocioId: string; rol: "DUENO" | "CAJERO" };

function firma(data: string): string {
  return crypto.createHmac("sha256", SECRET).update(data).digest("hex");
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

// ── Sesión de negocio (cajero/dueño) ─────────────────────

export async function setSesion(s: Sesion): Promise<void> {
  const data = `${s.negocioId}:${s.rol}`;
  const token = `${data}:${firma(data)}`;
  (await cookies()).set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function getSesion(): Promise<Sesion | null> {
  const c = (await cookies()).get(COOKIE_NAME);
  if (!c) return null;
  const partes = c.value.split(":");
  if (partes.length !== 3) return null;
  const [negocioId, rol, sig] = partes;
  if (rol !== "DUENO" && rol !== "CAJERO") return null;
  const esperado = firma(`${negocioId}:${rol}`);
  if (!timingSafeEqual(sig, esperado)) return null;
  return { negocioId, rol };
}

export async function clearSesion(): Promise<void> {
  (await cookies()).delete(COOKIE_NAME);
}

// ── Sesión admin ─────────────────────────────────────────

export async function setSesionAdmin(): Promise<void> {
  const token = firma("admin");
  (await cookies()).set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
}

export async function isAdmin(): Promise<boolean> {
  const c = (await cookies()).get(ADMIN_COOKIE);
  if (!c) return false;
  const esperado = firma("admin");
  return timingSafeEqual(c.value, esperado);
}

export async function clearSesionAdmin(): Promise<void> {
  (await cookies()).delete(ADMIN_COOKIE);
}

export function verificarAdminSecret(secret: string | null | undefined): boolean {
  const adminSecret = process.env.ADMIN_SECRET;
  if (!adminSecret) return false;
  if (!secret) return false;
  if (secret.length !== adminSecret.length) return false;
  return crypto.timingSafeEqual(Buffer.from(secret), Buffer.from(adminSecret));
}
