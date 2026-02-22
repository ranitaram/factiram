import { auth } from "@/lib/auth"; // Asegúrate de que la ruta a tu auth.ts sea correcta
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

  // 2. Buscamos al usuario y TODO su historial de auditorías, ordenado de la más nueva a la más vieja
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

  // 3. Next.js pide que los datos de la BD sean "planos" para pasarlos al cliente
  // Convertimos las fechas y los decimales a formatos compatibles
  const serializedAudits = user.audits.map(audit => ({
    ...audit,
    createdAt: audit.createdAt.toISOString(),
    ticketAvg: Number(audit.ticketAvg),
    costDirectPercent: Number(audit.costDirectPercent),
    fixedCosts: Number(audit.fixedCosts),
    desiredSalary: Number(audit.desiredSalary),
    marketingSpend: Number(audit.marketingSpend),
    emergencyFund: Number(audit.emergencyFund),
    netProfit: Number(audit.netProfit),
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

      {/* Aquí inyectamos el componente visual pasándole las auditorías del usuario */}
      <DashboardClient audits={serializedAudits} userName={session.user.name ?? "Usuario"} />
    </div>
  );
}