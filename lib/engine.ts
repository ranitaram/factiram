import { Decimal } from "decimal.js";
import { IndustryType, AuditStatus, TaxStatus } from "@prisma/client";
import { z } from "zod";

// RE-EXPORTAMOS los tipos para que el Formulario pueda usarlos
export { IndustryType, AuditStatus, TaxStatus };

/* =========================================================
   1. CONFIGURACIÓN Y VERSIONAMIENTO
========================================================= */
export const MODEL_VERSION = "1.3.4"; // v1.3.4: Fix Zod Empty String Errors
Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_UP });

/* =========================================================
   2. ESQUEMA DE VALIDACIÓN (ZOD) - VERSIÓN ANTI-ERRORES
========================================================= */

// Función auxiliar para limpiar números y evitar el error "too_small" con strings vacíos
const numericCoerce = z.coerce.number().catch(0);

const AuditInputSchema = z.object({
  industry: z.nativeEnum(IndustryType),
  status: z.nativeEnum(AuditStatus),
  
  // Usamos catch(0) para que si el usuario borra el input, el sistema no explote
  ticketAvg: z.coerce.number().positive().catch(0.01),
  costDirectPercent: z.coerce.number().min(0).max(100).catch(0), 
  fixedCosts: numericCoerce,
  desiredSalary: numericCoerce,
  marketingSpend: numericCoerce,
  emergencyFund: numericCoerce,
  
  operatingDays: z.coerce.number().int().min(1).max(31).catch(24),
  visibilityScore: z.coerce.number().int().min(1).max(10).catch(5),
  competitionScore: z.coerce.number().int().min(1).max(10).catch(5),
  differentiation: z.coerce.number().int().min(1).max(10).catch(5),
  capacityPerDay: numericCoerce,
  occupancy: z.coerce.number().min(1).max(100).catch(50),
  
  taxStatus: z.nativeEnum(TaxStatus),
  digitalScore: z.coerce.number().int().min(1).max(10).catch(5),
});

export type AuditInputs = z.infer<typeof AuditInputSchema>;

/* =========================================================
   3. CÁLCULOS FINANCIEROS (CON REALIDAD FISCAL)
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

  const marginPerUnit = ticket.mul(new Decimal(1).sub(costPct));
  const monthlyVolume = capacity.mul(days).mul(optimismFactor).mul(occupancy);

  const operatingProfit = marginPerUnit.mul(monthlyVolume).sub(fixed);

  // GOLPE DE REALIDAD: Impuestos
  const taxMultiplier = data.taxStatus === TaxStatus.INFORMAL 
    ? new Decimal(1) 
    : new Decimal(0.7);

  const finalNetProfit = operatingProfit.mul(taxMultiplier);

  const breakEvenUnits = marginPerUnit.gt(0) ? fixed.div(marginPerUnit) : new Decimal(0);
  const breakEvenMoney = breakEvenUnits.mul(ticket);

  const ltvProxy = marginPerUnit.mul(6);
  const cacProxy = (monthlyVolume.gt(0) && marketing.gt(0))
      ? marketing.div(monthlyVolume)
      : new Decimal(0);

  return {
    isViable: marginPerUnit.gt(0),
    marginPerUnit,
    breakEvenMoney,
    netProfit: finalNetProfit,
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

  return { finalScore: Math.min(Math.round(financeScore + marketScore + digitalScore), 100) };
}

/* =========================================================
   5. GENERADOR DE CONDICIONES (TRIGGERS)
========================================================= */
function generateConditions(data: AuditInputs, financials: ReturnType<typeof calculateFinancials>) {
  const conditions: string[] = [];
  const maxRevenue = data.ticketAvg * data.capacityPerDay * data.operatingDays;

  if (financials.netProfit.lt(0)) conditions.push("NEGATIVE_PROFIT");
  if (financials.breakEvenMoney.toNumber() > (maxRevenue * 0.7)) conditions.push("HIGH_FIXED_COSTS");
  if (data.occupancy < 50) conditions.push("LOW_OCCUPANCY");
  if (data.digitalScore < 5) conditions.push("POOR_DIGITAL_PRESENCE");
  
  if (data.occupancy >= 75 && financials.netProfit.toNumber() < (data.desiredSalary * 0.5)) {
    conditions.push("BUSY_BUT_BROKE");
  }

  if (financials.marginPerUnit.lte(0)) conditions.push("NEGATIVE_MARGIN");
  if (data.costDirectPercent > 60) conditions.push("HIGH_COSTS");
  if (data.differentiation < 4) conditions.push("COMMODITY_RISK");
  if (data.marketingSpend === 0 && data.status === AuditStatus.EN_MARCHA) conditions.push("NO_MARKETING");

  return conditions;
}

/* =========================================================
   6. ORQUESTADOR (SAFE PARSE)
========================================================= */
export function calculateAuditResults(rawData: unknown) {
  try {
    // Usamos .parse porque ahora el esquema tiene .catch() para auto-corregirse
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
  } catch (error) {
    console.error("Critical Engine Error:", error);
    throw error;
  }
}