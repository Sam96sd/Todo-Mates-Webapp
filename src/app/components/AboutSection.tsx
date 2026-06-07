import { ShieldCheck, Truck, MapPin, Star } from "lucide-react";
import { useLanguage } from "../i18n/LanguageContext";

export function AboutSection() {
  const { t, isRTL } = useLanguage();
  const fontFamily = isRTL ? "'Cairo', sans-serif" : "'Lato', sans-serif";
  const serifFamily = isRTL ? "'Cairo', sans-serif" : "'Playfair Display', serif";

  return (
    <section
      id="about"
      style={{ backgroundColor: "#EDE0C4", fontFamily, padding: "80px 0" }}
    >
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-16 items-start">
          <div>
            <p style={{ color: "#B85C38", fontSize: "0.8rem", letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: "4px" }}>
              {t.about.subtitle}
            </p>
            <h2
              style={{
                fontFamily: serifFamily,
                color: "#2C1A0E",
                fontSize: "2rem",
                fontWeight: 700,
                marginBottom: "20px",
                lineHeight: 1.25,
              }}
            >
              {t.about.titleLine1}
              <br />
              {t.about.titleLine2}
            </h2>
            <p style={{ color: "#6B5340", fontSize: "0.95rem", lineHeight: 1.8, marginBottom: "16px" }}>
              {t.about.paragraph1}
            </p>
            <p style={{ color: "#6B5340", fontSize: "0.95rem", lineHeight: 1.8, marginBottom: "16px" }}>
              {t.about.paragraph2}
            </p>

            <div
              style={{
                marginTop: "24px",
                padding: "18px 20px",
                backgroundColor: "#F4ECD8",
                border: "1px solid rgba(44,26,14,0.1)",
                borderRadius: "6px",
                borderLeft: isRTL ? undefined : "3px solid #B85C38",
                borderRight: isRTL ? "3px solid #B85C38" : undefined,
              }}
            >
              <p style={{ color: "#2C1A0E", fontSize: "0.9rem", lineHeight: 1.7, fontStyle: "italic" }}>
                {t.about.quote}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-5">
            {[
              { icon: MapPin, color: "#2D5016", iconColor: "#c5e87a", title: t.about.localDelivery, desc: t.about.localDeliveryDesc },
              { icon: Truck, color: "#8B6914", iconColor: "#F4ECD8", title: t.about.nationwide, desc: t.about.nationwideDesc },
              { icon: ShieldCheck, color: "#B85C38", iconColor: "#F4ECD8", title: t.about.original, desc: t.about.originalDesc },
              { icon: Star, color: "#2D5016", iconColor: "#c5e87a", title: t.about.bulkDiscounts, desc: t.about.bulkDiscountsDesc },
            ].map(({ icon: Icon, color, iconColor, title, desc }) => (
              <div
                key={title}
                style={{
                  display: "flex",
                  gap: "16px",
                  padding: "20px",
                  backgroundColor: "#F4ECD8",
                  borderRadius: "8px",
                  border: "1px solid rgba(44,26,14,0.1)",
                }}
              >
                <div
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "50%",
                    backgroundColor: color,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Icon size={20} style={{ color: iconColor }} />
                </div>
                <div>
                  <h4 style={{ color: "#2C1A0E", fontWeight: 700, marginBottom: "4px" }}>{title}</h4>
                  <p style={{ color: "#6B5340", fontSize: "0.87rem", lineHeight: 1.6 }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
