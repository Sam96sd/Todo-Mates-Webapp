import type { VercelRequest, VercelResponse } from "@vercel/node";

export function isAdminAuthorized(req: VercelRequest): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;

  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) return false;

  return header.slice("Bearer ".length) === expected;
}

export function requireAdmin(req: VercelRequest, res: VercelResponse): boolean {
  if (isAdminAuthorized(req)) return true;
  res.status(401).json({ error: "Unauthorized" });
  return false;
}
