-- Migration: Tambah field harga dan stok ke tabel item
-- Sesuai update GEMINI.md

ALTER TABLE "item" 
ADD COLUMN IF NOT EXISTS "price" DECIMAL(15,2),
ADD COLUMN IF NOT EXISTS "sellPrice" DECIMAL(15,2),
ADD COLUMN IF NOT EXISTS "discount" DECIMAL(15,2),
ADD COLUMN IF NOT EXISTS "isSpecialPrice" BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS "stockQty" INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS "printQty" INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS "pricingId" TEXT;

COMMENT ON COLUMN "item"."price" IS 'Harga modal/beli';
COMMENT ON COLUMN "item"."sellPrice" IS 'Harga jual';
COMMENT ON COLUMN "item"."isSpecialPrice" IS 'Flag harga spesial';
COMMENT ON COLUMN "item"."stockQty" IS 'Jumlah stok sistem';
