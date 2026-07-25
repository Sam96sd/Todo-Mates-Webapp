-- Migration: add sold_out flag to products
ALTER TABLE products ADD COLUMN IF NOT EXISTS sold_out BOOLEAN NOT NULL DEFAULT false;
