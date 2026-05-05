/*
  Warnings:

  - You are about to drop the column `piezasDia` on the `Producto` table. All the data in the column will be lost.
  - You are about to drop the column `clave` on the `UsuarioNegocio` table. All the data in the column will be lost.
  - You are about to drop the column `nombre` on the `UsuarioNegocio` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[negocioId,userId]` on the table `UsuarioNegocio` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `UsuarioNegocio` table without a default value. This is not possible if the table is not empty.
  - Added the required column `total` to the `VentaDia` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Producto" DROP COLUMN "piezasDia";

-- AlterTable
ALTER TABLE "Suscripcion" ADD COLUMN     "stripeCustomerId" TEXT,
ADD COLUMN     "stripeSubId" TEXT;

-- AlterTable
ALTER TABLE "UsuarioNegocio" DROP COLUMN "clave",
DROP COLUMN "nombre",
ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "VentaDia" ADD COLUMN     "total" DECIMAL(12,2) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "UsuarioNegocio_negocioId_userId_key" ON "UsuarioNegocio"("negocioId", "userId");

-- CreateIndex
CREATE INDEX "VentaDia_productoId_idx" ON "VentaDia"("productoId");

-- AddForeignKey
ALTER TABLE "UsuarioNegocio" ADD CONSTRAINT "UsuarioNegocio_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
