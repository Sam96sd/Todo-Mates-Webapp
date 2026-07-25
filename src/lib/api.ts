import type { Product } from "../app/components/ProductsSection";

export interface ContactInfo {
  whatsapp: string;
  instagram: string;
  facebook: string;
}

export interface DiscountTier {
  minQty: number;
  discountPct: number;
}

export interface StoreSettings {
  contact: ContactInfo;
  discountTiers: DiscountTier[];
}

const ADMIN_TOKEN_KEY = "mate-admin-token";

class ApiError extends Error {
  constructor(
    message: string,
    public status: number
  ) {
    super(message);
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(body.error ?? res.statusText, res.status);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

function adminHeaders(): HeadersInit {
  const token = sessionStorage.getItem(ADMIN_TOKEN_KEY);
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function setAdminToken(password: string) {
  sessionStorage.setItem(ADMIN_TOKEN_KEY, password);
}

export function clearAdminToken() {
  sessionStorage.removeItem(ADMIN_TOKEN_KEY);
}

export async function verifyAdminPassword(password: string): Promise<boolean> {
  try {
    await request<{ ok: boolean }>("/api/auth", {
      method: "POST",
      body: JSON.stringify({ password }),
    });
    return true;
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) return false;
    throw err;
  }
}

export async function fetchProducts(): Promise<Product[]> {
  return request<Product[]>("/api/products");
}

export async function createProduct(data: Omit<Product, "id">): Promise<Product> {
  return request<Product>("/api/products", {
    method: "POST",
    headers: adminHeaders(),
    body: JSON.stringify({
      name: data.name,
      description: data.description,
      nameAr: data.nameAr,
      descriptionAr: data.descriptionAr,
      price: data.price,
      category: data.category,
      image_url: data.image_url,
      sold_out: data.sold_out ?? false,
    }),
  });
}

export async function updateProduct(data: Product): Promise<Product> {
  return request<Product>("/api/products", {
    method: "PUT",
    headers: adminHeaders(),
    body: JSON.stringify({
      id: data.id,
      name: data.name,
      description: data.description,
      nameAr: data.nameAr,
      descriptionAr: data.descriptionAr,
      price: data.price,
      category: data.category,
      image_url: data.image_url,
      sold_out: data.sold_out ?? false,
    }),
  });
}

export async function deleteProduct(id: string): Promise<void> {
  await request(`/api/products?id=${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: adminHeaders(),
  });
}

export async function reorderProducts(order: string[]): Promise<Product[]> {
  return request<Product[]>("/api/products/reorder", {
    method: "PUT",
    headers: adminHeaders(),
    body: JSON.stringify({ order }),
  });
}

export async function uploadProductImage(imageDataUrl: string): Promise<string> {
  const { url } = await request<{ url: string }>("/api/upload", {
    method: "POST",
    headers: adminHeaders(),
    body: JSON.stringify({ image: imageDataUrl }),
  });
  return url;
}

export async function fetchSettings(): Promise<StoreSettings> {
  return request<StoreSettings>("/api/settings");
}

export async function updateContactInfo(contact: ContactInfo): Promise<StoreSettings> {
  return request<StoreSettings>("/api/settings", {
    method: "PUT",
    headers: adminHeaders(),
    body: JSON.stringify({ contact }),
  });
}

export async function updateDiscountTiers(discountTiers: DiscountTier[]): Promise<StoreSettings> {
  return request<StoreSettings>("/api/settings", {
    method: "PUT",
    headers: adminHeaders(),
    body: JSON.stringify({ discountTiers }),
  });
}
