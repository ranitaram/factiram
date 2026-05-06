-- DropIndex
DROP INDEX "UsuarioNegocio_negocioId_userId_key";

-- AlterTable
ALTER TABLE "UsuarioNegocio" ADD COLUMN     "clave" TEXT,
ALTER COLUMN "userId" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "UsuarioNegocio_negocioId_rol_idx" ON "UsuarioNegocio"("negocioId", "rol");
