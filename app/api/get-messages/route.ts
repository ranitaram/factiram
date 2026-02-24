import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { score, conditions, industry, status } = body;

    // EL QUERY MAESTRO: 
    // Buscamos mensajes que cumplan CUALQUIERA de estas dos grandes condiciones
    const messages = await prisma.diagnosticMessage.findMany({
      where: {
        OR: [
          // 1. LOS TRIGGERS (Prioridad Máxima)
          // Si el engine mandó 'BUSY_BUT_BROKE' o 'HIGH_FIXED_COSTS', los traemos sí o sí
          {
            conditionKey: { in: conditions || [] }
          },
          // 2. MENSAJES ESTRATÉGICOS POR SCORE
          // Traemos mensajes que encajen en el puntaje Y que sean para todos
          // O específicos para esta industria/estatus
          {
            conditionKey: null, // Solo mensajes generales, no alarmas
            minScore: { lte: score },
            maxScore: { gte: score },
            AND: [
              {
                OR: [
                  { industry: industry },
                  { industry: null }
                ]
              },
              {
                OR: [
                  { status: status },
                  { status: null }
                ]
              }
            ]
          }
        ]
      },
      // Ordenamos por color para que los consejos ROJOS aparezcan primero en el PDF
      orderBy: [
        { color: 'asc' },
        { createdAt: 'desc' }
      ]
    });

    return NextResponse.json({ messages });
  } catch (error) {
    console.error("Error crítico en la consulta de mensajes:", error);
    return NextResponse.json(
      { error: "Error interno al recuperar el diagnóstico" }, 
      { status: 500 }
    );
  }
}