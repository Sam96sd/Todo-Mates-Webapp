import express from "express";
import path from "path";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Let's import our Vercel handlers
import productsHandler from "./api/products.js";
import settingsHandler from "./api/settings.js";
import authHandler from "./api/auth.js";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Auto-migrate database column to support decimal prices in Vercel Postgres
  if (process.env.POSTGRES_URL) {
    try {
      const { sql } = await import("./src/lib/db.js");
      await sql`ALTER TABLE products ALTER COLUMN price TYPE NUMERIC(10, 2);`;
      console.log("Migration succeeded: changed products.price column to NUMERIC(10, 2)");
    } catch (err) {
      console.error("Migration warning on startup (products.price type alter):", err);
    }
  }

  // Helper to adapt Vercel Serverless Function signature (req, res) to Express signature
  const adaptHandler = (handler: any) => {
    return async (req: any, res: any, next: any) => {
      try {
        // Vercel Request has req.query, req.body, req.method, req.headers, etc.
        // Vercel Response has res.status(), res.json(), res.setHeader() which Express already provides!
        await handler(req, res);
      } catch (err) {
        next(err);
      }
    };
  };

  // Wire up API endpoints
  app.all("/api/products", adaptHandler(productsHandler));
  app.all("/api/settings", adaptHandler(settingsHandler));
  app.all("/api/auth", adaptHandler(authHandler));

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
