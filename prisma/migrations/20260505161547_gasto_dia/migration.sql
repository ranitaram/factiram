-- CreateTable
CREATE TABLE "GastoDia" (
    "id" TEXT NOT NULL,
    "negocioId" TEXT NOT NULL,
    "monto" DOUBLE PRECISION NOT NULL,
    "descripcion" TEXT,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GastoDia_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "GastoDia" ADD CONSTRAINT "GastoDia_negocioId_fkey" FOREIGN KEY ("negocioId") REFERENCES "Negocio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
