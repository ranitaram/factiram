-- CreateEnum
CREATE TYPE "IndustryType" AS ENUM ('COMIDA', 'SERVICIO', 'RETAIL', 'TECNICO');

-- CreateEnum
CREATE TYPE "AuditStatus" AS ENUM ('PROYECTO', 'EN_MARCHA');

-- CreateEnum
CREATE TYPE "TaxStatus" AS ENUM ('INFORMAL', 'RESICO', 'PERSONA_FISICA', 'PERSONA_MORAL');

-- CreateEnum
CREATE TYPE "DiagnosticCategory" AS ENUM ('RENTABILIDAD', 'RIESGO', 'MERCADO', 'OPERACION');

-- CreateEnum
CREATE TYPE "MessageColor" AS ENUM ('RED', 'YELLOW', 'GREEN');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Audit" (
    "id" TEXT NOT NULL,
    "industry" "IndustryType" NOT NULL,
    "status" "AuditStatus" NOT NULL DEFAULT 'PROYECTO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ticketAvg" DECIMAL(12,2) NOT NULL,
    "costDirectPercent" DECIMAL(5,2) NOT NULL,
    "fixedCosts" DECIMAL(12,2) NOT NULL,
    "desiredSalary" DECIMAL(12,2) NOT NULL,
    "marketingSpend" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "emergencyFund" INTEGER NOT NULL,
    "operatingDays" INTEGER NOT NULL,
    "visibilityScore" INTEGER NOT NULL,
    "competitionScore" INTEGER NOT NULL,
    "differentiation" INTEGER NOT NULL,
    "capacityPerDay" INTEGER NOT NULL,
    "taxStatus" "TaxStatus" NOT NULL,
    "digitalScore" INTEGER NOT NULL,
    "finalScore" INTEGER,
    "breakEvenPoint" DECIMAL(12,2),
    "ltvCacRatio" DECIMAL(12,2),
    "netProfit" DECIMAL(12,2),
    "fullDiagnosis" JSONB,
    "userId" TEXT,

    CONSTRAINT "Audit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DiagnosticMessage" (
    "id" SERIAL NOT NULL,
    "category" "DiagnosticCategory" NOT NULL,
    "industry" "IndustryType",
    "status" "AuditStatus",
    "minScore" INTEGER NOT NULL,
    "maxScore" INTEGER NOT NULL,
    "conditionKey" TEXT,
    "message" TEXT NOT NULL,
    "color" "MessageColor" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DiagnosticMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "Audit_industry_idx" ON "Audit"("industry");

-- CreateIndex
CREATE INDEX "Audit_status_idx" ON "Audit"("status");

-- CreateIndex
CREATE INDEX "Audit_userId_idx" ON "Audit"("userId");

-- CreateIndex
CREATE INDEX "DiagnosticMessage_category_idx" ON "DiagnosticMessage"("category");

-- CreateIndex
CREATE INDEX "DiagnosticMessage_industry_idx" ON "DiagnosticMessage"("industry");

-- CreateIndex
CREATE INDEX "DiagnosticMessage_status_idx" ON "DiagnosticMessage"("status");

-- AddForeignKey
ALTER TABLE "Audit" ADD CONSTRAINT "Audit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
