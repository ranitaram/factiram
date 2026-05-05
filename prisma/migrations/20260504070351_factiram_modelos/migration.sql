-- CreateEnum
CREATE TYPE "RolNegocio" AS ENUM ('DUENO', 'CAJERO');

-- CreateEnum
CREATE TYPE "TipoVenta" AS ENUM ('EFECTIVO', 'FIADO');

-- CreateEnum
CREATE TYPE "CategoriaGasto" AS ENUM ('RENTA', 'LUZ_AGUA', 'INTERNET', 'SUELDOS', 'PUBLICIDAD', 'OTROS');

-- CreateEnum
CREATE TYPE "EstadoAcceso" AS ENUM ('TRIAL', 'VIGENTE', 'VENCIDO');

-- CreateTable
CREATE TABLE "Negocio" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "slugUrl" TEXT NOT NULL,
    "diasLaborales" INTEGER NOT NULL DEFAULT 26,
    "inversionMercancia" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Negocio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Suscripcion" (
    "id" TEXT NOT NULL,
    "negocioId" TEXT NOT NULL,
    "trialStartedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "setupPagado" BOOLEAN NOT NULL DEFAULT false,
    "proximoPagoAt" TIMESTAMP(3),
    "estadoMensual" "EstadoAcceso" NOT NULL DEFAULT 'TRIAL',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Suscripcion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UsuarioNegocio" (
    "id" TEXT NOT NULL,
    "negocioId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "clave" TEXT NOT NULL,
    "rol" "RolNegocio" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UsuarioNegocio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Producto" (
    "id" TEXT NOT NULL,
    "negocioId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "costoCompra" DECIMAL(12,2) NOT NULL,
    "precioVenta" DECIMAL(12,2) NOT NULL,
    "piezasDia" DECIMAL(8,2) NOT NULL DEFAULT 0,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Producto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CostoFijo" (
    "id" TEXT NOT NULL,
    "negocioId" TEXT NOT NULL,
    "categoria" "CategoriaGasto" NOT NULL,
    "monto" DECIMAL(12,2) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CostoFijo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VentaDia" (
    "id" TEXT NOT NULL,
    "negocioId" TEXT NOT NULL,
    "productoId" TEXT NOT NULL,
    "cajeroId" TEXT NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "tipo" "TipoVenta" NOT NULL,
    "precioUnitario" DECIMAL(12,2) NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VentaDia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CobroFiado" (
    "id" TEXT NOT NULL,
    "negocioId" TEXT NOT NULL,
    "ventaId" TEXT NOT NULL,
    "montoRecuperado" DECIMAL(12,2) NOT NULL,
    "fechaCobro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CobroFiado_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Negocio_slugUrl_key" ON "Negocio"("slugUrl");

-- CreateIndex
CREATE INDEX "Negocio_slugUrl_idx" ON "Negocio"("slugUrl");

-- CreateIndex
CREATE UNIQUE INDEX "Suscripcion_negocioId_key" ON "Suscripcion"("negocioId");

-- CreateIndex
CREATE INDEX "UsuarioNegocio_negocioId_idx" ON "UsuarioNegocio"("negocioId");

-- CreateIndex
CREATE INDEX "Producto_negocioId_idx" ON "Producto"("negocioId");

-- CreateIndex
CREATE INDEX "CostoFijo_negocioId_idx" ON "CostoFijo"("negocioId");

-- CreateIndex
CREATE INDEX "VentaDia_negocioId_fecha_idx" ON "VentaDia"("negocioId", "fecha");

-- CreateIndex
CREATE INDEX "VentaDia_negocioId_tipo_idx" ON "VentaDia"("negocioId", "tipo");

-- CreateIndex
CREATE INDEX "CobroFiado_negocioId_idx" ON "CobroFiado"("negocioId");

-- CreateIndex
CREATE INDEX "CobroFiado_ventaId_idx" ON "CobroFiado"("ventaId");

-- AddForeignKey
ALTER TABLE "Suscripcion" ADD CONSTRAINT "Suscripcion_negocioId_fkey" FOREIGN KEY ("negocioId") REFERENCES "Negocio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsuarioNegocio" ADD CONSTRAINT "UsuarioNegocio_negocioId_fkey" FOREIGN KEY ("negocioId") REFERENCES "Negocio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Producto" ADD CONSTRAINT "Producto_negocioId_fkey" FOREIGN KEY ("negocioId") REFERENCES "Negocio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CostoFijo" ADD CONSTRAINT "CostoFijo_negocioId_fkey" FOREIGN KEY ("negocioId") REFERENCES "Negocio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VentaDia" ADD CONSTRAINT "VentaDia_negocioId_fkey" FOREIGN KEY ("negocioId") REFERENCES "Negocio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VentaDia" ADD CONSTRAINT "VentaDia_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VentaDia" ADD CONSTRAINT "VentaDia_cajeroId_fkey" FOREIGN KEY ("cajeroId") REFERENCES "UsuarioNegocio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CobroFiado" ADD CONSTRAINT "CobroFiado_negocioId_fkey" FOREIGN KEY ("negocioId") REFERENCES "Negocio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CobroFiado" ADD CONSTRAINT "CobroFiado_ventaId_fkey" FOREIGN KEY ("ventaId") REFERENCES "VentaDia"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
