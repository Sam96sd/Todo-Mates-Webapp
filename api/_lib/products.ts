import { sql } from "../../src/lib/db.js";

export interface ProductRow {
  id: string;
  name: string;
  description: string;
  name_ar: string | null;
  description_ar: string | null;
  price: number;
  category: "mate" | "bombilla" | "gourd" | "other";
  image_url: string | null;
  sort_order: number;
  sold_out: boolean;
}

export function mapProduct(row: ProductRow) {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    nameAr: row.name_ar ?? undefined,
    descriptionAr: row.description_ar ?? undefined,
    price: Number(row.price),
    category: row.category,
    image_url: row.image_url ?? undefined,
    sold_out: row.sold_out ?? false,
  };
}

export async function listProducts() {
  const { rows } = await sql<ProductRow>`
    SELECT id, name, description, name_ar, description_ar, price, category, image_url, sort_order, sold_out
    FROM products
    ORDER BY sort_order ASC, created_at ASC
  `;
  return rows.map(mapProduct);
}

export async function reorderProducts(order: string[]) {
  for (let i = 0; i < order.length; i++) {
    await sql`
      UPDATE products SET sort_order = ${i}, updated_at = NOW()
      WHERE id = ${order[i]}::uuid
    `;
  }
  return listProducts();
}

export async function createProduct(data: {
  name: string;
  description: string;
  nameAr?: string;
  descriptionAr?: string;
  price: number;
  category: string;
  image_url?: string;
  sold_out?: boolean;
}) {
  const { rows: maxRows } = await sql<{ next_order: number }>`
    SELECT COALESCE(MAX(sort_order), -1) + 1 AS next_order FROM products
  `;
  const nextOrder = maxRows[0]?.next_order ?? 0;

  const { rows } = await sql<ProductRow>`
    INSERT INTO products (name, description, name_ar, description_ar, price, category, image_url, sort_order, sold_out)
    VALUES (
      ${data.name},
      ${data.description},
      ${data.nameAr ?? null},
      ${data.descriptionAr ?? null},
      ${data.price},
      ${data.category},
      ${data.image_url ?? null},
      ${nextOrder},
      ${data.sold_out ?? false}
    )
    RETURNING id, name, description, name_ar, description_ar, price, category, image_url, sort_order, sold_out
  `;
  return mapProduct(rows[0]);
}

export async function updateProduct(data: {
  id: string;
  name: string;
  description: string;
  nameAr?: string;
  descriptionAr?: string;
  price: number;
  category: string;
  image_url?: string;
  sold_out?: boolean;
}) {
  const { rows } = await sql<ProductRow>`
    UPDATE products
    SET
      name = ${data.name},
      description = ${data.description},
      name_ar = ${data.nameAr ?? null},
      description_ar = ${data.descriptionAr ?? null},
      price = ${data.price},
      category = ${data.category},
      image_url = ${data.image_url ?? null},
      sold_out = ${data.sold_out ?? false},
      updated_at = NOW()
    WHERE id = ${data.id}::uuid
    RETURNING id, name, description, name_ar, description_ar, price, category, image_url, sort_order, sold_out
  `;
  if (!rows[0]) return null;
  return mapProduct(rows[0]);
}

export async function deleteProduct(id: string) {
  const { rowCount } = await sql`
    DELETE FROM products WHERE id = ${id}::uuid
  `;
  return (rowCount ?? 0) > 0;
}
