-- Add slug column (nullable first to backfill existing rows with TypeScript)
ALTER TABLE "AbastosProducto" ADD COLUMN "slug" TEXT;

-- Create unique index (will be validated after backfill)
CREATE UNIQUE INDEX "AbastosProducto_slug_key" ON "AbastosProducto"("slug");
CREATE INDEX "AbastosProducto_slug_idx" ON "AbastosProducto"("slug");
