import prisma from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export async function trackEvent(
  tipo: string,
  metadata?: Record<string, unknown>,
  visitorId?: string,
  sessionId?: string
) {
  try {
    await prisma.abastosEvento.create({
      data: {
        tipo,
        metadata: (metadata ?? {}) as Prisma.InputJsonValue,
        visitorId: visitorId ?? null,
        sessionId: sessionId ?? null,
      },
    });
  } catch {
    // Fails silently — no debe romper el flujo principal
  }
}
