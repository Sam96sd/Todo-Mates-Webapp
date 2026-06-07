import type { VercelRequest, VercelResponse } from "@vercel/node";
import { requireAdmin } from "./_lib/auth.js";
import {
  getContactInfo,
  listDiscountTiers,
  replaceDiscountTiers,
  updateContactInfo,
} from "./_lib/settings.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method === "GET") {
      const [contact, discountTiers] = await Promise.all([getContactInfo(), listDiscountTiers()]);
      return res.status(200).json({ contact, discountTiers });
    }

    if (!requireAdmin(req, res)) return;

    if (req.method === "PUT") {
      const { contact, discountTiers } = req.body ?? {};
      let nextContact = await getContactInfo();
      let nextTiers = await listDiscountTiers();

      if (contact) {
        nextContact = await updateContactInfo({
          whatsapp: contact.whatsapp,
          instagram: contact.instagram,
          facebook: contact.facebook,
        });
      }

      if (Array.isArray(discountTiers)) {
        nextTiers = await replaceDiscountTiers(discountTiers);
      }

      return res.status(200).json({ contact: nextContact, discountTiers: nextTiers });
    }

    res.setHeader("Allow", "GET, PUT");
    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("POSTGRES_SETTINGS_ERROR", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
