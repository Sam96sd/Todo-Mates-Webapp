import { sql as vercelSql } from "@vercel/postgres";

// Polyfill process.env if not defined
const isProduction = typeof process !== "undefined" && process.env && process.env.POSTGRES_URL;

// In-Memory Database State for fallback mode
const memoryDb = {
  products: [
    {
      id: "1",
      name: "Taragüi Mate 500g",
      description: "Classic Argentine yerba mate with a smooth, balanced flavour. Perfect for beginners and connoisseurs alike.",
      name_ar: "تاراغوي ماتا ٥٠٠غ",
      description_ar: "يربا ماتي كلاسيكية مستوردة من الأرجنتين بنكهة متوازنة وسلسة للبدء في الشرب.",
      price: 25000,
      category: "mate" as const,
      image_url: "https://images.unsplash.com/photo-1543362906-acfc16c67564?q=80&w=600&auto=format&fit=crop",
      sort_order: 0,
      sold_out: false,
      created_at: new Date(Date.now() - 600000)
    },
    {
      id: "2",
      name: "Cruz de Malta 500g",
      description: "Traditional strong mate with a rich earthy taste. A staple across Argentina for centuries.",
      name_ar: "كروز دي مالتا ٥٠٠غ",
      description_ar: "نكهة تقليدية قوية ذات طعم عميق لتجربة متكاملة للأشخاص المحبين لزيادة النكهة.",
      price: 27000,
      category: "mate" as const,
      image_url: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?q=80&w=600&auto=format&fit=crop",
      sort_order: 1,
      sold_out: false,
      created_at: new Date(Date.now() - 500000)
    },
    {
      id: "3",
      name: "Alpaca Bombilla",
      description: "Handcrafted alpaca metal straw with a filter tip, ideal for loose yerba mate. Durable and elegant.",
      name_ar: "مصاصة ألباكا أصيلة",
      description_ar: "نكهة أرجنتينية يدوية الصنع تمنحك فلترة مثالية، تدوم طويلاً وحمل مريح في اليد.",
      price: 18000,
      category: "bombilla" as const,
      image_url: "https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?q=80&w=600&auto=format&fit=crop",
      sort_order: 2,
      sold_out: false,
      created_at: new Date(Date.now() - 400000)
    }
  ],
  contact: {
    whatsapp: "963933000111",
    instagram: "todo.mates.sy",
    facebook: "todomates.arg"
  },
  discountTiers: [
    { min_qty: 3, discount_pct: 5 },
    { min_qty: 5, discount_pct: 10 },
    { min_qty: 10, discount_pct: 15 }
  ]
};

// SQL string parser and dynamic interpreter for memory fallback
export async function dbQuery(strings: TemplateStringsArray, ...values: any[]): Promise<{ rows: any[]; rowCount: number }> {
  if (isProduction) {
    try {
      // Forward directly to vercel sql
      const result = await (vercelSql as any)(strings, ...values);
      return { rows: result.rows, rowCount: result.rowCount };
    } catch (err) {
      console.warn("Database query failed on Vercel Postgres, falling back to memory database:", err);
    }
  }

  // Fallback memory implementation
  const query = strings.reduce((acc, str, i) => acc + str + (values[i] !== undefined ? `__VAL_${i}__` : ""), "").trim();

  // 1. SELECT products
  if (query.includes("SELECT") && query.includes("FROM products")) {
    const rows = [...memoryDb.products]
      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0) || a.created_at.getTime() - b.created_at.getTime())
      .map(p => ({
      id: p.id,
      name: p.name,
      description: p.description,
      name_ar: p.name_ar,
      description_ar: p.description_ar,
      price: p.price,
      category: p.category,
      image_url: p.image_url,
      sort_order: p.sort_order ?? 0,
      sold_out: p.sold_out ?? false,
      created_at: p.created_at
    }));
    return { rows, rowCount: rows.length };
  }

  // 1b. MAX sort_order for new products
  if (query.includes("MAX(sort_order)")) {
    const nextOrder = memoryDb.products.reduce((max, p) => Math.max(max, p.sort_order ?? 0), -1) + 1;
    return { rows: [{ next_order: nextOrder }], rowCount: 1 };
  }

  // 2. INSERT products
  if (query.includes("INSERT INTO products")) {
    const [name, description, name_ar, description_ar, price, category, image_url, sort_order, sold_out] = values;
    const newProduct = {
      id: Math.random().toString(36).substring(2, 11),
      name,
      description,
      name_ar,
      description_ar,
      price,
      category,
      image_url: image_url || null,
      sort_order: sort_order ?? memoryDb.products.length,
      sold_out: sold_out ?? false,
      created_at: new Date()
    };
    memoryDb.products.push(newProduct);
    return { rows: [newProduct], rowCount: 1 };
  }

  // 3. UPDATE products (reorder by sort_order)
  if (query.includes("UPDATE products") && query.includes("sort_order =")) {
    const [sort_order, id] = values;
    const product = memoryDb.products.find(p => p.id === id);
    if (product) {
      product.sort_order = sort_order;
      return { rows: [], rowCount: 1 };
    }
    return { rows: [], rowCount: 0 };
  }

  // 3b. UPDATE products (full edit)
  if (query.includes("UPDATE products")) {
    const [name, description, name_ar, description_ar, price, category, image_url, sold_out, id] = values;
    const index = memoryDb.products.findIndex(p => p.id === id);
    if (index !== -1) {
      memoryDb.products[index] = {
        ...memoryDb.products[index],
        name,
        description,
        name_ar,
        description_ar,
        price,
        category,
        image_url: image_url || null,
        sold_out: sold_out ?? false,
      };
      return { rows: [memoryDb.products[index]], rowCount: 1 };
    }
    return { rows: [], rowCount: 0 };
  }

  // 4. DELETE products
  if (query.includes("DELETE FROM products")) {
    const [id] = values;
    const initialLen = memoryDb.products.length;
    memoryDb.products = memoryDb.products.filter(p => p.id !== id);
    const count = initialLen - memoryDb.products.length;
    return { rows: [], rowCount: count };
  }

  // 5. GET contact_settings
  if (query.includes("SELECT") && query.includes("FROM contact_settings")) {
    return { rows: [memoryDb.contact], rowCount: 1 };
  }

  // 6. INSERT/UPSERT contact_settings
  if (query.includes("INSERT INTO contact_settings") || query.includes("UPDATE contact_settings")) {
    const [_id, whatsapp, instagram, facebook] = values;
    memoryDb.contact = { whatsapp, instagram, facebook };
    return { rows: [memoryDb.contact], rowCount: 1 };
  }

  // 7. GET discount_tiers
  if (query.includes("SELECT") && query.includes("discount_tiers")) {
    const rows = [...memoryDb.discountTiers].sort((a, b) => a.min_qty - b.min_qty);
    return { rows, rowCount: rows.length };
  }

  // 8. DELETE FROM discount_tiers
  if (query.includes("DELETE FROM discount_tiers")) {
    const count = memoryDb.discountTiers.length;
    memoryDb.discountTiers = [];
    return { rows: [], rowCount: count };
  }

  // 9. INSERT discount_tiers
  if (query.includes("INSERT INTO discount_tiers")) {
    const [min_qty, discount_pct] = values;
    memoryDb.discountTiers.push({ min_qty, discount_pct });
    return { rows: [], rowCount: 1 };
  }

  return { rows: [], rowCount: 0 };
}

interface SqlQuery {
  <T = any>(strings: TemplateStringsArray, ...values: any[]): Promise<{ rows: T[]; rowCount: number }>;
}

// Mimic tagged template literal with support for generic parameters
export const sql: SqlQuery = Object.assign(
  <T = any>(strings: TemplateStringsArray, ...values: any[]): Promise<{ rows: T[]; rowCount: number }> => {
    return dbQuery(strings, ...values) as any;
  },
  {}
);
