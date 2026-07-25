-- Migration: add 'other' category and sort_order column
-- Run this on an existing database that was created before these features.

ALTER TABLE products DROP CONSTRAINT IF EXISTS products_category_check;
ALTER TABLE products ADD CONSTRAINT products_category_check
  CHECK (category IN ('mate', 'bombilla', 'gourd', 'other'));

ALTER TABLE products ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 0;

-- Backfill sort_order from created_at for existing rows
WITH ranked AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at ASC) - 1 AS rn
  FROM products
)
UPDATE products p
SET sort_order = ranked.rn
FROM ranked
WHERE p.id = ranked.id;
