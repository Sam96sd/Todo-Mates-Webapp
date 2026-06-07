import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { sql } from "@vercel/postgres";

const __dirname = dirname(fileURLToPath(import.meta.url));

const SEED_PRODUCTS = [
  {
    name: "Taragüi Mate 500g",
    name_ar: "تاراغوي ماتي 500غ",
    description:
      "Classic Argentine yerba mate with a smooth, balanced flavour. Perfect for beginners and connoisseurs alike.",
    description_ar: "يربا ماتي أرجنتينية كلاسيكية بنكهة متوازنة وناعمة. مثالية للمبتدئين والخبراء على حد سواء.",
    price: 35000,
    category: "mate",
  },
  {
    name: "Cruz de Malta 500g",
    name_ar: "كروز دي مالطا 500غ",
    description: "Traditional strong mate with a rich earthy taste. A staple across Argentina for centuries.",
    description_ar: "ماتي تقليدي قوي بنكهة ترابية غنية. أساسي في الأرجنتين منذ قرون.",
    price: 32000,
    category: "mate",
  },
  {
    name: "Alpaca Bombilla",
    name_ar: "بومبيلا ألباكا",
    description:
      "Handcrafted alpaca metal straw with a filter tip, ideal for loose yerba mate. Durable and elegant.",
    description_ar: "ماصّة معدنية مصنوعة يدوياً من ألباكا مع فلتر، مثالية ليربا الماتي. متينة وأنيقة.",
    price: 18000,
    category: "bombilla",
  },
  {
    name: "Stainless Steel Bombilla",
    name_ar: "بومبيلا ستانلس ستيل",
    description: "High-quality stainless steel bombilla, easy to clean and long-lasting. A modern take on the classic.",
    description_ar: "بومبيلا ستانلس ستيل عالية الجودة، سهلة التنظيف وطويلة الأمد. لمسة عصرية على الكلاسيك.",
    price: 14000,
    category: "bombilla",
  },
  {
    name: "Natural Calabash Gourd",
    name_ar: "قرع ماتي طبيعي",
    description: "Traditional dried calabash gourd from Argentina. Each piece is unique with its own natural shape.",
    description_ar: "قرع ماتي تقليدي مجفف من الأرجنتين. كل قطعة فريدة بشكلها الطبيعي الخاص.",
    price: 22000,
    category: "gourd",
  },
  {
    name: "Leather-Wrapped Gourd",
    name_ar: "قرع ماتي بجلد",
    description:
      "Calabash gourd with genuine leather wrap and metal base. Premium look and feel, authentic craftsmanship.",
    description_ar: "قرع ماتي ملفوف بجلد أصلي وقاعدة معدنية. مظهر وفخامة، حرفية أصيلة.",
    price: 45000,
    category: "gourd",
  },
];

const SEED_TIERS = [
  { min_qty: 3, discount_pct: 5 },
  { min_qty: 6, discount_pct: 10 },
  { min_qty: 10, discount_pct: 15 },
  { min_qty: 20, discount_pct: 20 },
];

async function main() {
  const schema = readFileSync(join(__dirname, "schema.sql"), "utf8");
  await sql.query(schema);

  const { rows: productCount } = await sql`SELECT COUNT(*)::int AS count FROM products`;
  if (productCount[0].count === 0) {
    for (const p of SEED_PRODUCTS) {
      await sql`
        INSERT INTO products (name, name_ar, description, description_ar, price, category)
        VALUES (${p.name}, ${p.name_ar}, ${p.description}, ${p.description_ar}, ${p.price}, ${p.category})
      `;
    }
    console.log(`Seeded ${SEED_PRODUCTS.length} products.`);
  } else {
    console.log(`Products table already has ${productCount[0].count} rows — skipping seed.`);
  }

  const { rows: tierCount } = await sql`SELECT COUNT(*)::int AS count FROM discount_tiers`;
  if (tierCount[0].count === 0) {
    for (const t of SEED_TIERS) {
      await sql`
        INSERT INTO discount_tiers (min_qty, discount_pct)
        VALUES (${t.min_qty}, ${t.discount_pct})
      `;
    }
    console.log(`Seeded ${SEED_TIERS.length} discount tiers.`);
  } else {
    console.log(`Discount tiers table already has ${tierCount[0].count} rows — skipping seed.`);
  }

  console.log("Database initialized successfully.");
}

main().catch((err) => {
  console.error("Database initialization failed:", err);
  process.exit(1);
});
