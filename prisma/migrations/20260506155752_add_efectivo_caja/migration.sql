-- CreateTable
CREATE TABLE "EfectivoCaja" (
    "id" TEXT NOT NULL,
    "negocioId" TEXT NOT NULL,
    "fecha" DATE NOT NULL,
    "monto" DECIMAL(12,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EfectivoCaja_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EfectivoCaja_negocioId_fecha_idx" ON "EfectivoCaja"("negocioId", "fecha");

-- CreateIndex
CREATE UNIQUE INDEX "EfectivoCaja_negocioId_fecha_key" ON "EfectivoCaja"("negocioId", "fecha");

-- AddForeignKey
ALTER TABLE "EfectivoCaja" ADD CONSTRAINT "EfectivoCaja_negocioId_fkey" FOREIGN KEY ("negocioId") REFERENCES "Negocio"("id") ON DELETE CASCADE ON UPDATE CASCADE;
