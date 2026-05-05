/*
  Warnings:

  - You are about to alter the column `monto` on the `GastoDia` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(10,2)`.

*/
-- AlterTable
ALTER TABLE "GastoDia" ALTER COLUMN "monto" SET DATA TYPE DECIMAL(10,2);
