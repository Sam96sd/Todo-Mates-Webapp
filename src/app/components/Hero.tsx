interface HeroProps {
  onNavigate: (section: string) => void;
}

export function Hero({ onNavigate }: HeroProps) {
  return (
    <section
      id="home"
      style={{
        backgroundImage:
          "linear-gradient(to bottom right, #1e3a0f 0%, #2D5016 55%, #4a2c10 100%)",
        fontFamily: "'Lato', sans-serif",
        minHeight: "92vh",
        display: "flex",
        alignItems: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* decorative circles */}
      <div
        style={{
          position: "absolute",
          top: "-80px",
          right: "-80px",
          width: "400px",
          height: "400px",
          borderRadius: "50%",
          background: "rgba(197,232,122,0.06)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-120px",
          left: "-60px",
          width: "360px",
          height: "360px",
          borderRadius: "50%",
          background: "rgba(184,92,56,0.08)",
          pointerEvents: "none",
        }}
      />

      <div className="max-w-6xl mx-auto px-6 w-full grid md:grid-cols-2 gap-12 items-center py-20">
        {/* Text side */}
        <div>
          <p
            style={{
              color: "#c5e87a",
              fontSize: "0.85rem",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              marginBottom: "1rem",
            }}
          >
            Original · Argentina · Authentic
          </p>
          <h1
            style={{
              fontFamily: "'Playfair Display', serif",
              color: "#F4ECD8",
              fontSize: "clamp(2.4rem, 6vw, 4rem)",
              fontWeight: 700,
              lineHeight: 1.15,
              marginBottom: "1.25rem",
            }}
          >
            The Finest Yerba<br />
            <em style={{ color: "#c5e87a" }}>Mate</em> from Argentina
          </h1>
          <p
            style={{
              color: "rgba(244,236,216,0.8)",
              fontSize: "1.05rem",
              lineHeight: 1.7,
              maxWidth: "480px",
              marginBottom: "2rem",
            }}
          >
            Premium mate, bombillas, and gourds sourced directly from Argentina.
            Delivered to your door in Deir Atiyeh, shipped across Syria via Al-Kodmous.
          </p>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => {
                onNavigate("products");
                document.getElementById("products")?.scrollIntoView({ behavior: "smooth" });
              }}
              style={{
                backgroundColor: "#c5e87a",
                color: "#1e3a0f",
                border: "none",
                borderRadius: "4px",
                padding: "12px 28px",
                fontWeight: 700,
                cursor: "pointer",
                fontSize: "0.95rem",
                letterSpacing: "0.02em",
                transition: "opacity 0.2s",
              }}
              onMouseOver={(e) => ((e.target as HTMLElement).style.opacity = "0.85")}
              onMouseOut={(e) => ((e.target as HTMLElement).style.opacity = "1")}
            >
              Shop Now
            </button>
            <button
              onClick={() => {
                onNavigate("about");
                document.getElementById("about")?.scrollIntoView({ behavior: "smooth" });
              }}
              style={{
                backgroundColor: "transparent",
                color: "#F4ECD8",
                border: "1px solid rgba(244,236,216,0.45)",
                borderRadius: "4px",
                padding: "12px 28px",
                fontWeight: 400,
                cursor: "pointer",
                fontSize: "0.95rem",
                transition: "border-color 0.2s",
              }}
            >
              Learn More
            </button>
          </div>
        </div>

        {/* Visual side */}
        <div className="hidden md:flex justify-center">
          <div
            style={{
              width: "340px",
              height: "340px",
              borderRadius: "50%",
              background: "rgba(197,232,122,0.08)",
              border: "1px solid rgba(197,232,122,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            <span style={{ fontSize: "6rem" }}>🧉</span>
            <p
              style={{
                color: "rgba(197,232,122,0.7)",
                fontSize: "0.85rem",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
              }}
            >
              Pure Argentina
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
