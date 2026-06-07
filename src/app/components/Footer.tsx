import { Leaf } from "lucide-react";
import { useLanguage, interpolate } from "../i18n/LanguageContext";

interface FooterProps {
  contactInfo: {
    whatsapp: string;
    instagram: string;
    facebook: string;
  };
}

export function Footer({ contactInfo }: FooterProps) {
  const year = new Date().getFullYear();
  const { t, isRTL } = useLanguage();
  const fontFamily = isRTL ? "'Cairo', sans-serif" : "'Lato', sans-serif";
  const serifFamily = isRTL ? "'Cairo', sans-serif" : "'Playfair Display', serif";

  return (
    <footer
      style={{
        backgroundColor: "#2C1A0E",
        fontFamily,
        padding: "48px 0 28px",
        color: "#D4C5A0",
      }}
    >
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid md:grid-cols-3 gap-10 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Leaf size={20} style={{ color: "#c5e87a" }} />
              <span
                style={{
                  fontFamily: serifFamily,
                  color: "#F4ECD8",
                  fontSize: "1.15rem",
                  fontWeight: 700,
                }}
              >
                {t.brand}
              </span>
            </div>
            <p style={{ fontSize: "0.87rem", lineHeight: 1.7, color: "rgba(212,197,160,0.8)" }}>
              {t.footer.tagline}
            </p>
          </div>

          <div>
            <h4 style={{ color: "#F4ECD8", fontSize: "0.9rem", fontWeight: 700, marginBottom: "12px", letterSpacing: "0.05em" }}>
              {t.footer.delivery}
            </h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, fontSize: "0.85rem", lineHeight: 2 }}>
              <li>{t.footer.localDelivery}</li>
              <li>{t.footer.nationwide}</li>
              <li>{t.footer.packaged}</li>
            </ul>
          </div>

          <div>
            <h4 style={{ color: "#F4ECD8", fontSize: "0.9rem", fontWeight: 700, marginBottom: "12px", letterSpacing: "0.05em" }}>
              {t.footer.followUs}
            </h4>
            <div className="flex flex-col gap-2">
              {contactInfo.whatsapp ? (
                <a
                  href={`https://wa.me/${contactInfo.whatsapp.replace(/[^0-9]/g, "")}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: "#25D366", fontSize: "0.85rem", textDecoration: "none" }}
                >
                  💬 WhatsApp: {contactInfo.whatsapp}
                </a>
              ) : (
                <span style={{ opacity: 0.45, fontSize: "0.85rem" }}>{t.footer.whatsappComingSoon}</span>
              )}
              {contactInfo.instagram ? (
                <a
                  href={`https://instagram.com/${contactInfo.instagram.replace("@", "")}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: "#f77737", fontSize: "0.85rem", textDecoration: "none" }}
                >
                  📸 @{contactInfo.instagram.replace("@", "")}
                </a>
              ) : (
                <span style={{ opacity: 0.45, fontSize: "0.85rem" }}>{t.footer.instagramComingSoon}</span>
              )}
              {contactInfo.facebook ? (
                <a
                  href={`https://facebook.com/${contactInfo.facebook.replace("@", "")}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: "#1877F2", fontSize: "0.85rem", textDecoration: "none" }}
                >
                  👍 {contactInfo.facebook.replace("@", "")}
                </a>
              ) : (
                <span style={{ opacity: 0.45, fontSize: "0.85rem" }}>{t.footer.facebookComingSoon}</span>
              )}
            </div>
          </div>
        </div>

        <div
          style={{
            borderTop: "1px solid rgba(212,197,160,0.12)",
            paddingTop: "20px",
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "8px",
            fontSize: "0.78rem",
            color: "rgba(212,197,160,0.5)",
          }}
        >
          <span>{interpolate(t.footer.rights, { year })}</span>
          <span>{t.footer.original}</span>
        </div>
      </div>
    </footer>
  );
}
