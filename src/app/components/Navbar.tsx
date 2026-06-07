import { useState } from "react";
import { Menu, X, Leaf } from "lucide-react";
import { useLanguage } from "../i18n/LanguageContext";
import { LanguageToggle } from "./LanguageToggle";

interface NavbarProps {
  activeSection: string;
  onNavigate: (section: string) => void;
  isAdmin: boolean;
  onToggleAdmin: () => void;
}

export function Navbar({ activeSection, onNavigate, isAdmin, onToggleAdmin }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { t, isRTL } = useLanguage();

  const links = [
    { id: "home", label: t.nav.home },
    { id: "products", label: t.nav.products },
    { id: "bulk", label: t.nav.bulk },
    { id: "about", label: t.nav.about },
    { id: "faq", label: t.nav.faq },
  ];

  const handleNav = (id: string) => {
    onNavigate(id);
    setMobileOpen(false);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const fontFamily = isRTL ? "'Cairo', sans-serif" : "'Lato', sans-serif";
  const serifFamily = isRTL ? "'Cairo', sans-serif" : "'Playfair Display', serif";

  return (
    <nav
      style={{ fontFamily, backgroundColor: "#2D5016", color: "#F4ECD8" }}
      className="sticky top-0 z-50 shadow-md"
    >
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-16">
        <button
          onClick={() => handleNav("home")}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <Leaf size={22} style={{ color: "#c5e87a" }} />
          <span
            style={{
              fontFamily: serifFamily,
              fontSize: "1.25rem",
              fontWeight: 700,
              color: "#F4ECD8",
              letterSpacing: "0.03em",
            }}
          >
            {t.brand}
          </span>
        </button>

        <div className="hidden md:flex items-center gap-6">
          {links.map((l) => (
            <button
              key={l.id}
              onClick={() => handleNav(l.id)}
              style={{
                color: activeSection === l.id ? "#c5e87a" : "#F4ECD8",
                borderBottom: activeSection === l.id ? "2px solid #c5e87a" : "2px solid transparent",
                paddingBottom: "2px",
                transition: "color 0.2s, border-color 0.2s",
              }}
              className="text-sm hover:opacity-80"
            >
              {l.label}
            </button>
          ))}
          <LanguageToggle />
          <button
            onClick={onToggleAdmin}
            style={{
              backgroundColor: isAdmin ? "#B85C38" : "rgba(245,237,216,0.15)",
              color: "#F4ECD8",
              border: "1px solid rgba(245,237,216,0.3)",
              borderRadius: "4px",
              padding: "4px 12px",
              fontSize: "0.8rem",
              transition: "background-color 0.2s",
            }}
          >
            {isAdmin ? t.nav.exitAdmin : t.nav.admin}
          </button>
        </div>

        <div className="md:hidden flex items-center gap-3">
          <LanguageToggle />
          <button onClick={() => setMobileOpen(!mobileOpen)} style={{ color: "#F4ECD8" }}>
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div style={{ backgroundColor: "#234012", borderTop: "1px solid rgba(245,237,216,0.15)" }}>
          <div className="flex flex-col px-4 py-3 gap-3">
            {links.map((l) => (
              <button
                key={l.id}
                onClick={() => handleNav(l.id)}
                style={{ color: "#F4ECD8", textAlign: isRTL ? "right" : "left" }}
                className="text-sm py-1"
              >
                {l.label}
              </button>
            ))}
            <button
              onClick={() => { onToggleAdmin(); setMobileOpen(false); }}
              style={{ color: "#F4ECD8", textAlign: isRTL ? "right" : "left", opacity: 0.7 }}
              className="text-sm py-1"
            >
              {isAdmin ? t.nav.exitAdminMobile : t.nav.adminMobile}
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
