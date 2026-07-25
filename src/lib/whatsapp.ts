export function normalizeWhatsAppPhone(raw: string): string {
  return raw.replace(/[^0-9]/g, "");
}

export function buildWhatsAppUrl(phone: string, text: string): string {
  const digits = normalizeWhatsAppPhone(phone);
  if (!digits) return "";
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}
