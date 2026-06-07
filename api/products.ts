import type { VercelRequest, VercelResponse } from "@vercel/node";
import { requireAdmin } from "./_lib/auth.js";
import { createProduct, deleteProduct, listProducts, updateProduct } from "./_lib/products.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method === "GET") {
      const products = await listProducts();
      return res.status(200).json(products);
    }

    if (!requireAdmin(req, res)) return;

    if (req.method === "POST") {
      const { name, description, nameAr, descriptionAr, price, category, image_url } = req.body ?? {};
      if (!name?.trim() || !category || !price || price <= 0) {
        return res.status(400).json({ error: "name, category, and price are required" });
      }
      const product = await createProduct({
        name: name.trim(),
        description: description?.trim() ?? "",
        nameAr: nameAr?.trim(),
        descriptionAr: descriptionAr?.trim(),
        price: Number(price),
        category,
        image_url: image_url?.trim(),
      });
      return res.status(201).json(product);
    }

    if (req.method === "PUT") {
      const { id, name, description, nameAr, descriptionAr, price, category, image_url } = req.body ?? {};
      if (!id || !name?.trim() || !category || !price || price <= 0) {
        return res.status(400).json({ error: "id, name, category, and price are required" });
      }
      const product = await updateProduct({
        id,
        name: name.trim(),
        description: description?.trim() ?? "",
        nameAr: nameAr?.trim(),
        descriptionAr: descriptionAr?.trim(),
        price: Number(price),
        category,
        image_url: image_url?.trim(),
      });
      if (!product) return res.status(404).json({ error: "Product not found" });
      return res.status(200).json(product);
    }

    if (req.method === "DELETE") {
      const id = typeof req.query.id === "string" ? req.query.id : req.body?.id;
      if (!id) return res.status(400).json({ error: "id is required" });
      const deleted = await deleteProduct(id);
      if (!deleted) return res.status(404).json({ error: "Product not found" });
      return res.status(200).json({ success: true });
    }

    res.setHeader("Allow", "GET, POST, PUT, DELETE");
    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("POSTGRES_PRODUCTS_ERROR", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
