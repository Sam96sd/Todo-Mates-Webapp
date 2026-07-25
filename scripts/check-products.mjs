import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { sql } from "@vercel/postgres";

try {
  const count = await sql`SELECT COUNT(*)::int AS count FROM products`;
  console.log("product_count:", count.rows[0].count);

  const cols = await sql`
    SELECT column_name
    FROM information_schema.columns
    WHERE table_name = 'products'
    ORDER BY ordinal_position
  `;
  console.log("columns:", cols.rows.map((x) => x.column_name).join(", "));

  const sample = await sql`
    SELECT id, name, price, category, created_at
    FROM products
    ORDER BY created_at ASC
    LIMIT 20
  `;
  console.log("products:", JSON.stringify(sample.rows, null, 2));

  try {
    await sql`SELECT id, name, sort_order, sold_out FROM products LIMIT 1`;
    console.log("new_columns_query: OK");
  } catch (e) {
    console.log("new_columns_query: FAIL -", e.message);
  }
} catch (e) {
  console.error("ERROR:", e.message);
}
