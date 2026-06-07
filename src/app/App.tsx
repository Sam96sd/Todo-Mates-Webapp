import { useState, useEffect } from "react";
import { Navbar } from "./components/Navbar";
import { Hero } from "./components/Hero";
import { ProductsSection, type Product } from "./components/ProductsSection";
import { BulkCalculator } from "./components/BulkCalculator";
import { AboutSection } from "./components/AboutSection";
import { FAQChatbot } from "./components/FAQChatbot";
import { Footer } from "./components/Footer";
import { useLanguage } from "./i18n/LanguageContext";

interface BulkTier {
  minQty: number;
  discountPct: number;
}

interface ContactInfo {
  whatsapp: string;
  instagram: string;
  facebook: string;
}

const ADMIN_PASSWORD = "mate2024";

const INITIAL_PRODUCTS: Product[] = [
  {
    id: "1",
    name: "Taragüi Mate 500g",
    category: "mate",
    description: "Classic Argentine yerba mate with a smooth, balanced flavour. Perfect for beginners and connoisseurs alike.",
    price: 35000,
  },
  {
    id: "2",
    name: "Cruz de Malta 500g",
    category: "mate",
    description: "Traditional strong mate with a rich earthy taste. A staple across Argentina for centuries.",
    price: 32000,
  },
  {
    id: "3",
    name: "Alpaca Bombilla",
    category: "bombilla",
    description: "Handcrafted alpaca metal straw with a filter tip, ideal for loose yerba mate. Durable and elegant.",
    price: 18000,
  },
  {
    id: "4",
    name: "Stainless Steel Bombilla",
    category: "bombilla",
    description: "High-quality stainless steel bombilla, easy to clean and long-lasting. A modern take on the classic.",
    price: 14000,
  },
  {
    id: "5",
    name: "Natural Calabash Gourd",
    category: "gourd",
    description: "Traditional dried calabash gourd from Argentina. Each piece is unique with its own natural shape.",
    price: 22000,
  },
  {
    id: "6",
    name: "Leather-Wrapped Gourd",
    category: "gourd",
    description: "Calabash gourd with genuine leather wrap and metal base. Premium look and feel, authentic craftsmanship.",
    price: 45000,
  },
];

const INITIAL_TIERS: BulkTier[] = [
  { minQty: 3, discountPct: 5 },
  { minQty: 6, discountPct: 10 },
  { minQty: 10, discountPct: 15 },
  { minQty: 20, discountPct: 20 },
];

export default function App() {
  // MARKER-MAKE-KIT-INVOKED
  const { t, isRTL } = useLanguage();
  const fontFamily = isRTL ? "'Cairo', sans-serif" : "'Lato', sans-serif";
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [tiers, setTiers] = useState<BulkTier[]>(INITIAL_TIERS);
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    whatsapp: "",
    instagram: "",
    facebook: "",
  });
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeSection, setActiveSection] = useState("home");

  useEffect(() => {
    const sections = ["home", "products", "bulk", "about", "faq"];
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { threshold: 0.3 }
    );
    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const handleToggleAdmin = () => {
    if (isAdmin) {
      setIsAdmin(false);
      return;
    }
    const pw = window.prompt(t.admin.passwordPrompt);
    if (pw === ADMIN_PASSWORD) {
      setIsAdmin(true);
    } else if (pw !== null) {
      window.alert(t.admin.incorrectPassword);
    }
  };

  const handleAddProduct = (p: Omit<Product, "id">) => {
    setProducts((prev) => [...prev, { ...p, id: Date.now().toString() }]);
  };

  const handleEditProduct = (updated: Product) => {
    setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  };

  const handleDeleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div style={{ fontFamily, minHeight: "100vh", backgroundColor: "#F4ECD8" }}>
      {isAdmin && (
        <div
          style={{
            backgroundColor: "#B85C38",
            color: "#F4ECD8",
            textAlign: "center",
            padding: "7px 16px",
            fontSize: "0.82rem",
            fontWeight: 700,
            letterSpacing: "0.05em",
          }}
        >
          {t.admin.banner}
        </div>
      )}

      <Navbar
        activeSection={activeSection}
        onNavigate={setActiveSection}
        isAdmin={isAdmin}
        onToggleAdmin={handleToggleAdmin}
      />

      <Hero onNavigate={setActiveSection} />

      <ProductsSection
        products={products}
        onAdd={handleAddProduct}
        onEdit={handleEditProduct}
        onDelete={handleDeleteProduct}
        isAdmin={isAdmin}
      />

      <BulkCalculator
        products={products}
        tiers={tiers}
        onUpdateTiers={setTiers}
        isAdmin={isAdmin}
      />

      <AboutSection />

      <FAQChatbot
        contactInfo={contactInfo}
        onUpdateContact={setContactInfo}
        isAdmin={isAdmin}
      />

      <Footer contactInfo={contactInfo} />
    </div>
  );
}
