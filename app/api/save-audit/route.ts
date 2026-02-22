import { NextResponse } from "next/server";
import { auth } from "@/lib/auth"; // Asegúrate de que apunte a donde tienes auth.ts
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });

    const body = await req.json();
    const { formData, result } = body;

    const newAudit = await prisma.audit.create({
      data: {
        userId: user.id,
        industry: formData.industry,
        status: formData.status,
        ticketAvg: formData.ticketAvg,
        costDirectPercent: formData.costDirectPercent,
        fixedCosts: formData.fixedCosts,
        desiredSalary: formData.desiredSalary,
        marketingSpend: formData.marketingSpend,
        operatingDays: formData.operatingDays,
        capacityPerDay: formData.capacityPerDay,
        occupancy: formData.occupancy,
        visibilityScore: formData.visibilityScore,
        competitionScore: formData.competitionScore,
        differentiation: formData.differentiation,
        digitalScore: formData.digitalScore,
        
        // 👇 AQUÍ ESTÁN LOS DOS DATOS QUE FALTABAN 👇
        emergencyFund: formData.emergencyFund,
        taxStatus: formData.taxStatus,
        
        // Resultados
        finalScore: result.finalScore,
        netProfit: result.netProfit,
        breakEvenPoint: result.breakEvenPoint,
        ltvCacRatio: result.ltvCacRatio,
      },
    });

    return NextResponse.json({ success: true, auditId: newAudit.id });
  } catch (error) {
    console.error("Error guardando auditoría:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}