-- Make slug NOT NULL now that all rows have been backfilled
ALTER TABLE "AbastosProducto" ALTER COLUMN "slug" SET NOT NULL;
