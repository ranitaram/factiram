import { Decimal } from "decimal.js";
import { IndustryType, AuditStatus, TaxStatus } from "@prisma/client";
import { z } from "zod";

// RE-EXPORTAMOS los tipos para que el Formulario pueda usarlos
export { IndustryType, AuditStatus, TaxStatus };

/* =========================================================
   1. CONFIGURACIÓN Y VERSIONAMIENTO
========================================================= */
export const MODEL_VERSION = "1.3.0"; // Subimos versión por los nuevos Triggers
Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_UP });

/* =========================================================
   2. ESQUEMA DE VALIDACIÓN (ZOD)
========================================================= */
const AuditInputSchema = z.object({
  industry: z.enum(IndustryType),
  status: z.enum(AuditStatus),
  ticketAvg: z.number().positive().max(9999999),
  costDirectPercent: z.number().min(0), 
  fixedCosts: z.number().min(0).max(9999999),
  desiredSalary: z.number().min(0).max(9999999),
  marketingSpend: z.number().min(0).max(9999999),
  emergencyFund: z.number().min(0).default(0),
  operatingDays: z.number().int().min(1).max(31),
  visibilityScore: z.number().int().min(1).max(10),
  competitionScore: z.number().int().min(1).max(10),
  differentiation: z.number().int().min(1).max(10),
  capacityPerDay: z.number().min(0).max(9999999),
  occupancy: z.number().min(5).max(100).default(50),
  taxStatus: z.enum(TaxStatus),
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
  
  const occupancy = new Decimal(data.occupancy).div(100);

  const optimismFactor = data.status === AuditStatus.PROYECTO 
    ? new Decimal(0.8) 
    : new Decimal(1.0);

  // Margen unitario (Puede ser negativo si costPct > 100%)
  const marginPerUnit = ticket.mul(new Decimal(1).sub(costPct));

  // Si el margen es negativo, el negocio pierde dinero con cada venta
  if (marginPerUnit.lte(0)) {
    const monthlyVolume = capacity.mul(days).mul(optimismFactor).mul(occupancy);
    const netLoss = marginPerUnit.mul(monthlyVolume).sub(fixed);

    return {
      isViable: false,
      marginPerUnit,
      breakEvenMoney: new Decimal(0),
      netProfit: netLoss,
      ltvProxy: new Decimal(0),
      cacProxy: new Decimal(0),
      salary,
      marketing,
      capacity,
    };
  }

  const monthlyVolume = capacity.mul(days).mul(optimismFactor).mul(occupancy);
  const netProfit = marginPerUnit.mul(monthlyVolume).sub(fixed);
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
  let financeScore = 0;
  if (financials.netProfit.gt(0) && financials.salary.gt(0)) {
    if (financials.netProfit.gte(financials.salary)) {
      financeScore = 40;
    } else {
      financeScore = financials.netProfit
        .div(financials.salary)
        .mul(40)
        .toDecimalPlaces(2)
        .toNumber();
    }
  }

  const marketBase = (data.visibilityScore + (11 - data.competitionScore) + (data.differentiation * 2)) / 4;
  const marketScore = Math.min(marketBase * 4, 40);
  const digitalScore = Math.min(data.digitalScore * 2, 20);

  const finalScore = Math.min(Math.round(financeScore + marketScore + digitalScore), 100);

  return { financeScore, marketScore, digitalScore, finalScore };
}

/* =========================================================
   5. GENERADOR DE CONDICIONES (TRIGGERS INTELIGENTES)
========================================================= */
function generateConditions(data: AuditInputs, financials: ReturnType<typeof calculateFinancials>) {
  const conditions: string[] = [];
  
  // Capacidad máxima de ingresos mensuales si estuviera al 100%
  const maxRevenue = data.ticketAvg * data.capacityPerDay * data.operatingDays;

  // --- TRIGGERS NUEVOS (Basados en la Semilla Maestra) ---
  
  if (financials.netProfit.lt(0)) conditions.push("NEGATIVE_PROFIT");
  
  // Si el punto de equilibrio es mayor al 70% de las ventas máximas posibles
  if (financials.breakEvenMoney.toNumber() > (maxRevenue * 0.7)) conditions.push("HIGH_FIXED_COSTS");
  
  if (data.occupancy < 50) conditions.push("LOW_OCCUPANCY");
  
  if (data.digitalScore < 5) conditions.push("POOR_DIGITAL_PRESENCE");
  
  // "Lleno pero pobre": Ocupación > 75% pero ganancia menor a la mitad de su sueldo ideal
  if (data.occupancy >= 75 && financials.netProfit.toNumber() < (data.desiredSalary * 0.5)) {
    conditions.push("BUSY_BUT_BROKE");
  }

  // --- TRIGGERS EXISTENTES ---
  if (financials.capacity.eq(0)) conditions.push("ZERO_CAPACITY");
  if (financials.marginPerUnit.lte(0)) conditions.push("NEGATIVE_MARGIN");
  if (new Decimal(data.costDirectPercent).gt(60)) conditions.push("HIGH_COSTS");
  
  if (financials.netProfit.gt(0) && financials.netProfit.lt(financials.salary)) conditions.push("LOW_PROFITABILITY");
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
  try {
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
      triggeredConditions: conditions, // ¡Aquí viajan las llaves hacia el frontend!
    };
  } catch (error) {
    console.error("Critical Engine Error:", error);
    throw error;
  }
}