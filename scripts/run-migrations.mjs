import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { sql } from "@vercel/postgres";

const __dirname = dirname(fileURLToPath(import.meta.url));

async function runMigration(filename) {
  const path = join(__dirname, filename);
  const contents = readFileSync(path, "utf8");
  const statements = contents
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean);

  for (const statement of statements) {
    console.log("Running:", statement.split("\n")[0].slice(0, 80) + "...");
    await sql.query(statement);
  }
}

try {
  await runMigration("migrate-v2.sql");
  console.log("migrate-v2.sql applied.");
  await runMigration("migrate-v3.sql");
  console.log("migrate-v3.sql applied.");

  const count = await sql`SELECT COUNT(*)::int AS count FROM products`;
  console.log("Products still in database:", count.rows[0].count);
} catch (e) {
  console.error("Migration failed:", e.message);
  process.exit(1);
}
