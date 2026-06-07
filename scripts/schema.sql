-- Mate Argentin store schema for Vercel Postgres / Neon

CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  name_ar TEXT,
  description_ar TEXT,
  price NUMERIC(10, 2) NOT NULL CHECK (price > 0),
  category TEXT NOT NULL CHECK (category IN ('mate', 'bombilla', 'gourd')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS discount_tiers (
  id SERIAL PRIMARY KEY,
  min_qty INTEGER NOT NULL UNIQUE CHECK (min_qty >= 1),
  discount_pct INTEGER NOT NULL CHECK (discount_pct > 0 AND discount_pct <= 100)
);

CREATE TABLE IF NOT EXISTS contact_settings (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  whatsapp TEXT NOT NULL DEFAULT '',
  instagram TEXT NOT NULL DEFAULT '',
  facebook TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO contact_settings (id, whatsapp, instagram, facebook)
VALUES (1, '', '', '')
ON CONFLICT (id) DO NOTHING;
