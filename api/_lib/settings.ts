import { sql } from "@vercel/postgres";

export interface ContactInfo {
  whatsapp: string;
  instagram: string;
  facebook: string;
}

export interface DiscountTier {
  minQty: number;
  discountPct: number;
}

export async function getContactInfo(): Promise<ContactInfo> {
  const { rows } = await sql<{ whatsapp: string; instagram: string; facebook: string }>`
    SELECT whatsapp, instagram, facebook FROM contact_settings WHERE id = 1
  `;
  const row = rows[0];
  return {
    whatsapp: row?.whatsapp ?? "",
    instagram: row?.instagram ?? "",
    facebook: row?.facebook ?? "",
  };
}

export async function updateContactInfo(data: Partial<ContactInfo>): Promise<ContactInfo> {
  const current = await getContactInfo();
  const next = {
    whatsapp: data.whatsapp ?? current.whatsapp,
    instagram: data.instagram ?? current.instagram,
    facebook: data.facebook ?? current.facebook,
  };

  await sql`
    INSERT INTO contact_settings (id, whatsapp, instagram, facebook, updated_at)
    VALUES (1, ${next.whatsapp}, ${next.instagram}, ${next.facebook}, NOW())
    ON CONFLICT (id) DO UPDATE SET
      whatsapp = EXCLUDED.whatsapp,
      instagram = EXCLUDED.instagram,
      facebook = EXCLUDED.facebook,
      updated_at = NOW()
  `;

  return next;
}

export async function listDiscountTiers(): Promise<DiscountTier[]> {
  const { rows } = await sql<{ min_qty: number; discount_pct: number }>`
    SELECT min_qty, discount_pct FROM discount_tiers ORDER BY min_qty ASC
  `;
  return rows.map((r) => ({ minQty: r.min_qty, discountPct: r.discount_pct }));
}

export async function replaceDiscountTiers(tiers: DiscountTier[]): Promise<DiscountTier[]> {
  const valid = tiers.filter((t) => t.minQty >= 3 && t.discountPct > 0 && t.discountPct <= 100);

  await sql`DELETE FROM discount_tiers`;

  for (const tier of valid) {
    await sql`
      INSERT INTO discount_tiers (min_qty, discount_pct)
      VALUES (${tier.minQty}, ${tier.discountPct})
    `;
  }

  return listDiscountTiers();
}
