import type { VercelRequest, VercelResponse } from "@vercel/node";
import { requireAdmin } from "../_lib/auth.js";
import { reorderProducts } from "../_lib/products.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "PUT") {
    res.setHeader("Allow", "PUT");
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!requireAdmin(req, res)) return;

  try {
    const { order } = req.body ?? {};
    if (!Array.isArray(order) || order.some((id) => typeof id !== "string")) {
      return res.status(400).json({ error: "order must be an array of product ids" });
    }

    const products = await reorderProducts(order);
    return res.status(200).json(products);
  } catch (error) {
    console.error("POSTGRES_REORDER_ERROR", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
