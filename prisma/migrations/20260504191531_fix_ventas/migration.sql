/*
  Warnings:

  - You are about to drop the column `cajeroId` on the `VentaDia` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "VentaDia" DROP CONSTRAINT "VentaDia_cajeroId_fkey";

-- DropIndex
DROP INDEX "VentaDia_negocioId_tipo_idx";

-- DropIndex
DROP INDEX "VentaDia_productoId_idx";

-- AlterTable
ALTER TABLE "VentaDia" DROP COLUMN "cajeroId";
