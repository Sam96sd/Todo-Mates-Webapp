import { v2 as cloudinary } from "cloudinary";

let configured = false;

function ensureConfigured() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    return false;
  }

  if (!configured) {
    cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret });
    configured = true;
  }

  return true;
}

export function isCloudinaryConfigured() {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  );
}

export async function uploadProductImage(dataUrl: string) {
  if (!ensureConfigured()) {
    throw new Error("Cloudinary is not configured");
  }

  const result = await cloudinary.uploader.upload(dataUrl, {
    folder: "todo-mates/products",
    resource_type: "image",
    transformation: [{ width: 1200, crop: "limit" }, { quality: "auto:good", fetch_format: "auto" }],
  });

  return result.secure_url;
}
