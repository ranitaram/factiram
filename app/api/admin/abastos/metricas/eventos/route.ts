import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { isAdmin } from "@/lib/factiram-session";

export async function GET(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  try {
    const { searchParams } = new URL(req.url);
    const offset = Math.max(0, parseInt(searchParams.get("offset") ?? "0", 10) || 0);
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") ?? "10", 10) || 10));

    const eventos = await prisma.abastosEvento.findMany({
      orderBy: { createdAt: "desc" },
      skip: offset,
      take: limit + 1,
      select: { id: true, tipo: true, metadata: true, createdAt: true },
    });

    const hasMore = eventos.length > limit;
    if (hasMore) eventos.pop();

    return NextResponse.json({
      eventos: eventos.map((e) => ({
        id: e.id,
        tipo: e.tipo,
        metadata: e.metadata,
        fecha: e.createdAt.toISOString(),
      })),
      hasMore,
      offset: offset + eventos.length,
    });
  } catch {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
