import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { score, conditions, industry, status } = body;

    const messages = await prisma.diagnosticMessage.findMany({
      where: {
        OR: [
          // 1. Mensajes Universales basados en el Score (1 al 100)
          {
            conditionKey: null,
            industry: null,
            minScore: { lte: score },
            maxScore: { gte: score }
          },
          // 2. Alarmas Rojas (Triggers) disparadas por el Engine
          {
            conditionKey: { in: conditions || [] }
          },
          // 3. Mensajes específicos por Industria y Estatus del proyecto
          {
            industry: industry,
            status: status,
            conditionKey: null // Aseguramos que no se cruce con los triggers
          }
        ]
      }
    });

    return NextResponse.json({ messages });
  } catch (error) {
    console.error("Error buscando mensajes:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}