import type { VercelRequest, VercelResponse } from "@vercel/node";
import { requireAdmin } from "./_lib/auth.js";
import { isCloudinaryConfigured, uploadProductImage } from "./_lib/cloudinary.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!requireAdmin(req, res)) return;

  if (!isCloudinaryConfigured()) {
    return res.status(503).json({
      error: "Image upload is not configured. Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.",
    });
  }

  try {
    const { image } = req.body ?? {};
    if (typeof image !== "string" || !image.startsWith("data:image/")) {
      return res.status(400).json({ error: "A valid base64 image is required" });
    }

    const url = await uploadProductImage(image);
    return res.status(200).json({ url });
  } catch (error) {
    console.error("CLOUDINARY_UPLOAD_ERROR", error);
    return res.status(500).json({ error: "Failed to upload image" });
  }
}
