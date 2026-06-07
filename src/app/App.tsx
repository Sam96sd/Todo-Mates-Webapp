import { useState, useEffect, useCallback } from "react";
import { Navbar } from "./components/Navbar";
import { Hero } from "./components/Hero";
import { ProductsSection, type Product } from "./components/ProductsSection";
import { BulkCalculator } from "./components/BulkCalculator";
import { AboutSection } from "./components/AboutSection";
import { FAQChatbot } from "./components/FAQChatbot";
import { Footer } from "./components/Footer";
import { useLanguage } from "./i18n/LanguageContext";
import {
  fetchProducts,
  fetchSettings,
  createProduct,
  updateProduct,
  deleteProduct,
  updateContactInfo,
  updateDiscountTiers,
  verifyAdminPassword,
  setAdminToken,
  clearAdminToken,
  type ContactInfo,
  type DiscountTier,
} from "../lib/api";

export default function App() {
  // MARKER-MAKE-KIT-INVOKED
  const { t, isRTL } = useLanguage();
  const fontFamily = isRTL ? "'Cairo', sans-serif" : "'Lato', sans-serif";

  const [products, setProducts] = useState<Product[]>([]);
  const [tiers, setTiers] = useState<DiscountTier[]>([]);
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    whatsapp: "",
    instagram: "",
    facebook: "",
  });
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadStoreData = useCallback(async () => {
    setLoadError(null);
    try {
      const [productsData, settingsData] = await Promise.all([fetchProducts(), fetchSettings()]);
      setProducts(productsData);
      setTiers(settingsData.discountTiers);
      setContactInfo(settingsData.contact);
    } catch (err) {
      console.error(err);
      setLoadError("Could not load store data. Please refresh the page.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStoreData();
  }, [loadStoreData]);

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

  const handleToggleAdmin = async () => {
    if (isAdmin) {
      setIsAdmin(false);
      clearAdminToken();
      return;
    }
    const pw = window.prompt(t.admin.passwordPrompt);
    if (!pw) return;
    try {
      const ok = await verifyAdminPassword(pw);
      if (ok) {
        setAdminToken(pw);
        setIsAdmin(true);
      } else {
        window.alert(t.admin.incorrectPassword);
      }
    } catch {
      window.alert("Could not verify admin password. Is the API running?");
    }
  };

  const handleAddProduct = async (p: Omit<Product, "id">) => {
    const created = await createProduct(p);
    setProducts((prev) => [...prev, created]);
  };

  const handleEditProduct = async (updated: Product) => {
    const saved = await updateProduct(updated);
    setProducts((prev) => prev.map((p) => (p.id === saved.id ? saved : p)));
  };

  const handleDeleteProduct = async (id: string) => {
    await deleteProduct(id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const handleUpdateTiers = async (nextTiers: DiscountTier[]) => {
    const settings = await updateDiscountTiers(nextTiers);
    setTiers(settings.discountTiers);
  };

  const handleUpdateContact = async (info: ContactInfo) => {
    const settings = await updateContactInfo(info);
    setContactInfo(settings.contact);
  };

  if (isLoading) {
    return (
      <div
        style={{
          fontFamily,
          minHeight: "100vh",
          backgroundColor: "#F4ECD8",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#2C1A0E",
        }}
      >
        Loading store…
      </div>
    );
  }

  return (
    <div style={{ fontFamily, minHeight: "100vh", backgroundColor: "#F4ECD8" }}>
      {loadError && (
        <div
          style={{
            backgroundColor: "#c0392b",
            color: "#F4ECD8",
            textAlign: "center",
            padding: "8px 16px",
            fontSize: "0.85rem",
          }}
        >
          {loadError}
        </div>
      )}

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
        onUpdateTiers={handleUpdateTiers}
        isAdmin={isAdmin}
      />

      <AboutSection />

      <FAQChatbot
        contactInfo={contactInfo}
        onUpdateContact={handleUpdateContact}
        isAdmin={isAdmin}
      />

      <Footer contactInfo={contactInfo} />
    </div>
  );
}
