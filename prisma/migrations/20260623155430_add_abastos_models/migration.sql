-- CreateTable
CREATE TABLE "AbastosProducto" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "unidad" TEXT NOT NULL DEFAULT 'kg',
    "categoria" TEXT NOT NULL DEFAULT 'Basicos',
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AbastosProducto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AbastosProveedor" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AbastosProveedor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AbastosProductoPrecio" (
    "id" TEXT NOT NULL,
    "productoId" TEXT NOT NULL,
    "proveedorId" TEXT NOT NULL,
    "precio" DECIMAL(12,2) NOT NULL,
    "unidad" TEXT NOT NULL,
    "verificado" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "negocioId" TEXT,

    CONSTRAINT "AbastosProductoPrecio_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AbastosProducto_nombre_key" ON "AbastosProducto"("nombre");

-- CreateIndex
CREATE INDEX "AbastosProducto_activo_idx" ON "AbastosProducto"("activo");

-- CreateIndex
CREATE INDEX "AbastosProducto_nombre_idx" ON "AbastosProducto"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "AbastosProveedor_nombre_key" ON "AbastosProveedor"("nombre");

-- CreateIndex
CREATE INDEX "AbastosProveedor_activo_idx" ON "AbastosProveedor"("activo");

-- CreateIndex
CREATE INDEX "AbastosProductoPrecio_productoId_createdAt_idx" ON "AbastosProductoPrecio"("productoId", "createdAt");

-- CreateIndex
CREATE INDEX "AbastosProductoPrecio_proveedorId_idx" ON "AbastosProductoPrecio"("proveedorId");

-- CreateIndex
CREATE INDEX "AbastosProductoPrecio_verificado_idx" ON "AbastosProductoPrecio"("verificado");

-- AddForeignKey
ALTER TABLE "AbastosProductoPrecio" ADD CONSTRAINT "AbastosProductoPrecio_negocioId_fkey" FOREIGN KEY ("negocioId") REFERENCES "Negocio"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AbastosProductoPrecio" ADD CONSTRAINT "AbastosProductoPrecio_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "AbastosProducto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AbastosProductoPrecio" ADD CONSTRAINT "AbastosProductoPrecio_proveedorId_fkey" FOREIGN KEY ("proveedorId") REFERENCES "AbastosProveedor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
