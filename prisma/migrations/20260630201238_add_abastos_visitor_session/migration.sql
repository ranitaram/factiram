-- AlterTable
ALTER TABLE "AbastosEvento" ADD COLUMN     "sessionId" TEXT,
ADD COLUMN     "visitorId" TEXT;

-- CreateIndex
CREATE INDEX "AbastosEvento_visitorId_idx" ON "AbastosEvento"("visitorId");

-- CreateIndex
CREATE INDEX "AbastosEvento_sessionId_idx" ON "AbastosEvento"("sessionId");
