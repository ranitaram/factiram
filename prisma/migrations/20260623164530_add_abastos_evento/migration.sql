-- CreateTable
CREATE TABLE "AbastosEvento" (
    "id" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "metadata" JSONB DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AbastosEvento_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AbastosEvento_tipo_createdAt_idx" ON "AbastosEvento"("tipo", "createdAt");
