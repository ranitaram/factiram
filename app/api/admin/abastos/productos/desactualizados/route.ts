import { NextResponse } from "next/server";
import { getProductosDesactualizados } from "@/lib/abastos-queries";
import { isAdmin } from "@/lib/factiram-session";

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  try {
    const productos = await getProductosDesactualizados(14);
    return NextResponse.json({ productos });
  } catch {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
