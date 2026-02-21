import { Decimal } from "decimal.js";
import { IndustryType, AuditStatus, TaxStatus } from "@prisma/client";
import { z } from "zod";

// RE-EXPORTAMOS los tipos para que el Formulario pueda usarlos
export { IndustryType, AuditStatus, TaxStatus };

/* =========================================================
   1. CONFIGURACIÓN Y VERSIONAMIENTO
========================================================= */
export const MODEL_VERSION = "1.2.0"; // Incrementamos por la integración de Ocupación
Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_UP });

/* =========================================================
   2. ESQUEMA DE VALIDACIÓN (ZOD)
========================================================= */
const AuditInputSchema = z.object({
  industry: z.nativeEnum(IndustryType),
  status: z.nativeEnum(AuditStatus),
  ticketAvg: z.number().positive(),
  costDirectPercent: z.number().min(0).max(100),
  fixedCosts: z.number().min(0),
  desiredSalary: z.number().min(0),
  marketingSpend: z.number().min(0),
  emergencyFund: z.number().min(0).default(0),
  operatingDays: z.number().int().min(1).max(31),
  visibilityScore: z.number().int().min(1).max(10),
  competitionScore: z.number().int().min(1).max(10),
  differentiation: z.number().int().min(1).max(10),
  capacityPerDay: z.number().min(0),
  occupancy: z.number().min(5).max(100).default(50), // <-- NUEVO: Factor de Ocupación Real
  taxStatus: z.nativeEnum(TaxStatus),
  digitalScore: z.number().int().min(1).max(10),
});

export type AuditInputs = z.infer<typeof AuditInputSchema>;

/* =========================================================
   3. CÁLCULOS FINANCIEROS (EL CORAZÓN)
========================================================= */
function calculateFinancials(data: AuditInputs) {
  const ticket = new Decimal(data.ticketAvg);
  const costPct = new Decimal(data.costDirectPercent).div(100);
  const fixed = new Decimal(data.fixedCosts);
  const marketing = new Decimal(data.marketingSpend);
  const salary = new Decimal(data.desiredSalary);
  const capacity = new Decimal(data.capacityPerDay);
  const days = new Decimal(data.operatingDays);
  
  // Transformamos el % de ocupación a decimal (ej: 50 -> 0.5)
  const occupancy = new Decimal(data.occupancy).div(100);

  // --- FACTOR DE OPTIMISMO (Para Proyectos) ---
  const optimismFactor = data.status === AuditStatus.PROYECTO 
    ? new Decimal(0.8) 
    : new Decimal(1.0);

  const marginPerUnit = ticket.mul(new Decimal(1).sub(costPct));

  if (marginPerUnit.lte(0)) {
    return {
      isViable: false,
      marginPerUnit,
      breakEvenMoney: new Decimal(0),
      netProfit: new Decimal(0),
      ltvProxy: new Decimal(0),
      cacProxy: new Decimal(0),
      salary,
      marketing,
      capacity,
    };
  }

  // --- CÁLCULO DE VOLUMEN REAL ---
  // Volumen = (Capacidad Diaria * Días * Factor Proyecto) * % de Ocupación Real
  const monthlyVolume = capacity.mul(days).mul(optimismFactor).mul(occupancy);
  
  // Utilidad = (Margen * Volumen Real) - Gastos Fijos
  const netProfit = marginPerUnit.mul(monthlyVolume).sub(fixed);
  
  // Punto de equilibrio (Ventas mínimas para no perder)
  const breakEvenUnits = fixed.div(marginPerUnit);
  const breakEvenMoney = breakEvenUnits.mul(ticket);

  const ltvProxy = marginPerUnit.mul(6);
  const cacProxy = (monthlyVolume.gt(0) && marketing.gt(0))
      ? marketing.div(monthlyVolume)
      : new Decimal(0);

  return {
    isViable: true,
    marginPerUnit,
    breakEvenMoney,
    netProfit,
    ltvProxy,
    cacProxy,
    salary,
    marketing,
    capacity,
  };
}

/* =========================================================
   4. MODELO DE PUNTUACIÓN (SCORING)
========================================================= */
function calculateScores(data: AuditInputs, financials: ReturnType<typeof calculateFinancials>) {
  if (!financials.isViable) {
    return { financeScore: 0, marketScore: 0, digitalScore: 0, finalScore: 0 };
  }

  let financeScore = 0;
  // El score financiero ahora será mucho más realista al basarse en el volumen real/ocupación
  if (financials.netProfit.gte(financials.salary)) {
    financeScore = 40;
  } else if (financials.netProfit.gt(0) && financials.salary.gt(0)) {
    financeScore = financials.netProfit
      .div(financials.salary)
      .mul(40)
      .toDecimalPlaces(2)
      .toNumber();
  }

  const marketBase = (data.visibilityScore + (11 - data.competitionScore) + (data.differentiation * 2)) / 4;
  const marketScore = Math.min(marketBase * 4, 40);
  const digitalScore = Math.min(data.digitalScore * 2, 20);

  const finalScore = Math.min(Math.round(financeScore + marketScore + digitalScore), 100);

  return { financeScore, marketScore, digitalScore, finalScore };
}

/* =========================================================
   5. GENERADOR DE CONDICIONES (TRIGGERS)
========================================================= */
function generateConditions(data: AuditInputs, financials: ReturnType<typeof calculateFinancials>) {
  const conditions: string[] = [];

  if (financials.capacity.eq(0)) {
    conditions.push("ZERO_CAPACITY");
  }

  if (!financials.isViable) {
    conditions.push("NEGATIVE_MARGIN");
    return conditions;
  }

  if (new Decimal(data.costDirectPercent).gt(60)) conditions.push("HIGH_COSTS");
  if (financials.netProfit.lt(financials.salary)) conditions.push("LOW_PROFITABILITY");
  if (data.differentiation < 4) conditions.push("COMMODITY_RISK");
  if (financials.marketing.eq(0) && data.status === "EN_MARCHA") conditions.push("NO_MARKETING");
  
  if (financials.cacProxy.gt(financials.ltvProxy) && financials.cacProxy.gt(0)) {
    conditions.push("UNSUSTAINABLE_CAC");
  }

  return conditions;
}

/* =========================================================
   6. ORQUESTADOR (EXPORTADO)
========================================================= */
export function calculateAuditResults(rawData: unknown) {
  const data = AuditInputSchema.parse(rawData);

  const financials = calculateFinancials(data);
  const scores = calculateScores(data, financials);
  const conditions = generateConditions(data, financials);

  return {
    modelVersion: MODEL_VERSION,
    finalScore: scores.finalScore,
    breakEvenPoint: financials.breakEvenMoney.toDecimalPlaces(2).toNumber(),
    netProfit: financials.netProfit.toDecimalPlaces(2).toNumber(),
    
    ltvCacRatio: financials.cacProxy.gt(0)
        ? financials.ltvProxy.div(financials.cacProxy).toDecimalPlaces(2).toNumber()
        : null,

    triggeredConditions: conditions,
  };
}