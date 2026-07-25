const CLOUDINARY_HOST = "res.cloudinary.com";

/** Apply Cloudinary transforms for faster delivery; pass through other URLs unchanged. */
export function optimizeProductImageUrl(url: string | undefined, width = 600): string | undefined {
  if (!url) return undefined;
  if (!url.includes(CLOUDINARY_HOST) || !url.includes("/upload/")) return url;
  if (url.includes("/upload/w_")) return url;
  return url.replace("/upload/", `/upload/w_${width},q_auto,f_auto/`);
}

const MAX_FILE_BYTES = 8 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export function validateImageFile(file: File): string | null {
  if (!ACCEPTED_TYPES.includes(file.type)) {
    return "Please choose a JPEG, PNG, WebP, or GIF image.";
  }
  if (file.size > MAX_FILE_BYTES) {
    return "Image must be 8 MB or smaller.";
  }
  return null;
}

/** Resize and compress in the browser before upload to keep uploads fast. */
export function compressImageForUpload(file: File, maxWidth = 1200, quality = 0.85): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read image file"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Could not load image"));
      img.onload = () => {
        const scale = Math.min(1, maxWidth / img.width);
        const width = Math.round(img.width * scale);
        const height = Math.round(img.height * scale);
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Could not process image"));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}
