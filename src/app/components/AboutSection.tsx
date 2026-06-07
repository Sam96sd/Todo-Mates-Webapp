import { ShieldCheck, Truck, MapPin, Star } from "lucide-react";

export function AboutSection() {
  return (
    <section
      id="about"
      style={{ backgroundColor: "#EDE0C4", fontFamily: "'Lato', sans-serif", padding: "80px 0" }}
    >
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-16 items-start">
          {/* About text */}
          <div>
            <p style={{ color: "#B85C38", fontSize: "0.8rem", letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: "4px" }}>
              Who We Are
            </p>
            <h2
              style={{
                fontFamily: "'Playfair Display', serif",
                color: "#2C1A0E",
                fontSize: "2rem",
                fontWeight: 700,
                marginBottom: "20px",
                lineHeight: 1.25,
              }}
            >
              Authentic Argentine<br />Mate Culture
            </h2>
            <p style={{ color: "#6B5340", fontSize: "0.95rem", lineHeight: 1.8, marginBottom: "16px" }}>
              We are passionate about bringing the true Argentine mate experience to Syria. Every product we sell is 100% original, imported directly from Argentina — no copies, no substitutes.
            </p>
            <p style={{ color: "#6B5340", fontSize: "0.95rem", lineHeight: 1.8, marginBottom: "16px" }}>
              Our prices are carefully set to reflect the real cost and quality of authentic Argentine products. <strong style={{ color: "#2C1A0E" }}>Prices are strict</strong> — the only exception is bulk purchases, where we pass our savings directly to you.
            </p>

            <div
              style={{
                marginTop: "24px",
                padding: "18px 20px",
                backgroundColor: "#F4ECD8",
                border: "1px solid rgba(44,26,14,0.1)",
                borderRadius: "6px",
                borderLeft: "3px solid #B85C38",
              }}
            >
              <p style={{ color: "#2C1A0E", fontSize: "0.9rem", lineHeight: 1.7, fontStyle: "italic" }}>
                "We guarantee every single product is original from Argentina. No imitations, no shortcuts — just authentic mate, bombillas, and gourds."
              </p>
            </div>
          </div>

          {/* Delivery & features */}
          <div className="flex flex-col gap-5">
            <div
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
                  backgroundColor: "#2D5016",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <MapPin size={20} style={{ color: "#c5e87a" }} />
              </div>
              <div>
                <h4 style={{ color: "#2C1A0E", fontWeight: 700, marginBottom: "4px" }}>Local Delivery — Deir Atiyeh</h4>
                <p style={{ color: "#6B5340", fontSize: "0.87rem", lineHeight: 1.6 }}>
                  We deliver directly to your door anywhere in Deir Atiyeh. Fast, personal, and reliable.
                </p>
              </div>
            </div>

            <div
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
                  backgroundColor: "#8B6914",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Truck size={20} style={{ color: "#F4ECD8" }} />
              </div>
              <div>
                <h4 style={{ color: "#2C1A0E", fontWeight: 700, marginBottom: "4px" }}>Nationwide Shipping — Al-Kodmous</h4>
                <p style={{ color: "#6B5340", fontSize: "0.87rem", lineHeight: 1.6 }}>
                  For orders outside Deir Atiyeh, we ship via <strong>Al-Kodmous</strong> delivery company to all Syrian cities.
                </p>
              </div>
            </div>

            <div
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
                  backgroundColor: "#B85C38",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <ShieldCheck size={20} style={{ color: "#F4ECD8" }} />
              </div>
              <div>
                <h4 style={{ color: "#2C1A0E", fontWeight: 700, marginBottom: "4px" }}>100% Original from Argentina</h4>
                <p style={{ color: "#6B5340", fontSize: "0.87rem", lineHeight: 1.6 }}>
                  Every item is verified original. We import directly to ensure authenticity — no gray-market products.
                </p>
              </div>
            </div>

            <div
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
                  backgroundColor: "#2D5016",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Star size={20} style={{ color: "#c5e87a" }} />
              </div>
              <div>
                <h4 style={{ color: "#2C1A0E", fontWeight: 700, marginBottom: "4px" }}>Bulk Discounts Available</h4>
                <p style={{ color: "#6B5340", fontSize: "0.87rem", lineHeight: 1.6 }}>
                  While prices are fixed for single items, bulk orders of 3+ pieces enjoy special percentage discounts.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
