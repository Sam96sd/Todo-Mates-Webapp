import { Globe } from "lucide-react";
import { useLanguage } from "../i18n/LanguageContext";

export function LanguageToggle() {
  const { t, toggleLanguage } = useLanguage();

  return (
    <button
      onClick={toggleLanguage}
      aria-label={`Switch to ${t.language.switchTo}`}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "6px",
        backgroundColor: "rgba(245,237,216,0.15)",
        color: "#F4ECD8",
        border: "1px solid rgba(245,237,216,0.3)",
        borderRadius: "4px",
        padding: "4px 12px",
        fontSize: "0.8rem",
        cursor: "pointer",
        transition: "background-color 0.2s",
      }}
      onMouseOver={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = "rgba(245,237,216,0.25)")}
      onMouseOut={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = "rgba(245,237,216,0.15)")}
    >
      <Globe size={14} />
      <span>{t.language.switchTo}</span>
    </button>
  );
}
