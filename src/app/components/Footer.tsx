import { Leaf } from "lucide-react";

interface FooterProps {
  contactInfo: {
    whatsapp: string;
    instagram: string;
    facebook: string;
  };
}

export function Footer({ contactInfo }: FooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer
      style={{
        backgroundColor: "#2C1A0E",
        fontFamily: "'Lato', sans-serif",
        padding: "48px 0 28px",
        color: "#D4C5A0",
      }}
    >
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid md:grid-cols-3 gap-10 mb-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Leaf size={20} style={{ color: "#c5e87a" }} />
              <span
                style={{
                  fontFamily: "'Playfair Display', serif",
                  color: "#F4ECD8",
                  fontSize: "1.15rem",
                  fontWeight: 700,
                }}
              >
                Mate Argentin
              </span>
            </div>
            <p style={{ fontSize: "0.87rem", lineHeight: 1.7, color: "rgba(212,197,160,0.8)" }}>
              Authentic Argentine mate products delivered to your door in Syria.
              100% original — no imitations.
            </p>
          </div>

          {/* Delivery */}
          <div>
            <h4 style={{ color: "#F4ECD8", fontSize: "0.9rem", fontWeight: 700, marginBottom: "12px", letterSpacing: "0.05em" }}>
              Delivery
            </h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, fontSize: "0.85rem", lineHeight: 2 }}>
              <li>📍 Local delivery — Deir Atiyeh</li>
              <li>🚛 Nationwide — via Al-Kodmous</li>
              <li>📦 Carefully packaged orders</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 style={{ color: "#F4ECD8", fontSize: "0.9rem", fontWeight: 700, marginBottom: "12px", letterSpacing: "0.05em" }}>
              Follow Us
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
                <span style={{ opacity: 0.45, fontSize: "0.85rem" }}>💬 WhatsApp — coming soon</span>
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
                <span style={{ opacity: 0.45, fontSize: "0.85rem" }}>📸 Instagram — coming soon</span>
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
                <span style={{ opacity: 0.45, fontSize: "0.85rem" }}>👍 Facebook — coming soon</span>
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
          <span>© {year} Mate Argentin — All rights reserved</span>
          <span>🇦🇷 Original Products from Argentina</span>
        </div>
      </div>
    </footer>
  );
}
