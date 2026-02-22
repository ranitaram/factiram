import { auth } from "@/lib/auth"; 
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import DashboardClient from "@/components/DashboardClient";

export default async function DashboardPage() {
  // 1. Verificamos la sesión
  const session = await auth();
  
  // Si no hay sesión, lo regresamos a la pantalla principal
  if (!session?.user?.email) {
    redirect("/");
  }

  // 2. Buscamos al usuario y su historial de auditorías
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      audits: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!user) {
    redirect("/");
  }

  // 3. Serialización profunda: Convertimos Decimales de Prisma a Numbers de JS
  const serializedAudits = user.audits.map(audit => ({
    ...audit,
    // Fechas
    createdAt: audit.createdAt.toISOString(),
    updatedAt: audit.updatedAt.toISOString(),
    
    // Campos Numéricos (Decimal -> Number)
    ticketAvg: Number(audit.ticketAvg),
    costDirectPercent: Number(audit.costDirectPercent),
    fixedCosts: Number(audit.fixedCosts),
    desiredSalary: Number(audit.desiredSalary),
    marketingSpend: Number(audit.marketingSpend),
    emergencyFund: Number(audit.emergencyFund),
    capacityPerDay: Number(audit.capacityPerDay),
    occupancy: Number(audit.occupancy),
    netProfit: Number(audit.netProfit),
    finalScore: Number(audit.finalScore),
    
    // Campos opcionales o con lógica de nulos
    ltvCacRatio: audit.ltvCacRatio ? Number(audit.ltvCacRatio) : null,
    breakEvenPoint: audit.breakEvenPoint ? Number(audit.breakEvenPoint) : null,
  }));

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 md:py-20">
      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl font-black text-midnight tracking-tighter uppercase italic mb-4">
          Panel de Control
        </h1>
        <p className="text-slate-500 font-medium text-lg">
          Hola, <span className="text-emerald-600 font-bold">{session.user.name}</span>. Aquí está el registro histórico de tus diagnósticos.
        </p>
      </div>

      {/* Enviamos los datos limpios al componente de cliente */}
      <DashboardClient audits={serializedAudits} userName={session.user.name ?? "Usuario"} />
    </div>
  );
}