import { useState, useEffect, useCallback } from "react";
import { Navbar } from "./components/Navbar";
import { Hero } from "./components/Hero";
import { ProductsSection, type Product } from "./components/ProductsSection";
import { BulkCalculator } from "./components/BulkCalculator";
import { AboutSection } from "./components/AboutSection";
import { FAQChatbot } from "./components/FAQChatbot";
import { Footer } from "./components/Footer";
import { useLanguage } from "./i18n/LanguageContext";
import { addCartItem, removeCartItem, updateCartItemQty, type CartItem } from "../lib/cart";
import {
  fetchProducts,
  fetchSettings,
  createProduct,
  updateProduct,
  deleteProduct,
  reorderProducts,
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
    whatsapp: "wa.me/+963947941447",
    instagram: "",
    facebook: "https://www.facebook.com/share/1PQrbmGZs2/",
  });
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Admin authentication custom modal states
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authPasswordInput, setAuthPasswordInput] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Auto-restore admin session if token exists
  useEffect(() => {
    const cachedToken = sessionStorage.getItem("mate-admin-token");
    if (cachedToken) {
      setIsAdmin(true);
    }
  }, []);

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

  const handleToggleAdmin = () => {
    if (isAdmin) {
      setIsAdmin(false);
      clearAdminToken();
      return;
    }
    setAuthPasswordInput("");
    setAuthError(null);
    setIsAuthModalOpen(true);
  };

  const handleVerifyPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authPasswordInput) return;
    setIsVerifying(true);
    setAuthError(null);
    try {
      const ok = await verifyAdminPassword(authPasswordInput);
      if (ok) {
        setAdminToken(authPasswordInput);
        setIsAdmin(true);
        setIsAuthModalOpen(false);
        setAuthPasswordInput("");
      } else {
        setAuthError(t.admin.incorrectPassword);
      }
    } catch (err) {
      console.error(err);
      setAuthError("Could not verify admin password. Is the API running?");
    } finally {
      setIsVerifying(false);
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

  const handleReorderProducts = async (order: string[]) => {
    const reordered = await reorderProducts(order);
    setProducts(reordered);
  };

  const handleAddToCart = (productId: string, qty: number) => {
    setCartItems((prev) => addCartItem(prev, productId, qty));
  };

  const handleUpdateCartQty = (productId: string, qty: number) => {
    setCartItems((prev) => updateCartItemQty(prev, productId, qty));
  };

  const handleRemoveFromCart = (productId: string) => {
    setCartItems((prev) => removeCartItem(prev, productId));
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
        onReorder={handleReorderProducts}
        onAddToCart={handleAddToCart}
        isAdmin={isAdmin}
      />

      <BulkCalculator
        products={products}
        tiers={tiers}
        cartItems={cartItems}
        onAddToCart={handleAddToCart}
        onUpdateCartQty={handleUpdateCartQty}
        onRemoveFromCart={handleRemoveFromCart}
        onUpdateTiers={handleUpdateTiers}
        whatsapp={contactInfo.whatsapp || "wa.me/+963947941447"}
        isAdmin={isAdmin}
      />

      <AboutSection />

      <FAQChatbot
        contactInfo={contactInfo}
        onUpdateContact={handleUpdateContact}
        isAdmin={isAdmin}
      />

      <Footer contactInfo={contactInfo} />

      {/* Modern, Accessible, Iframe-friendly Admin Password Modal */}
      {isAuthModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(44, 26, 14, 0.6)",
            backdropFilter: "blur(4px)",
            padding: "16px",
          }}
        >
          <div
            style={{
              backgroundColor: "#F4ECD8",
              borderRadius: "8px",
              boxShadow: "0 10px 25px -5px rgba(44, 26, 14, 0.3)",
              width: "100%",
              maxWidth: "400px",
              border: "1px solid rgba(44, 26, 14, 0.1)",
              padding: "24px",
              direction: isRTL ? "rtl" : "ltr",
            }}
          >
            <h3
              style={{
                fontFamily: isRTL ? "'Cairo', sans-serif" : "'Playfair Display', serif",
                color: "#2C1A0E",
                fontSize: "1.25rem",
                fontWeight: 700,
                marginBottom: "16px",
              }}
            >
              {t.admin.passwordPrompt}
            </h3>

            <form onSubmit={handleVerifyPassword} className="flex flex-col gap-4">
              <input
                type="password"
                required
                autoFocus
                placeholder={isRTL ? "أدخل كلمة المرور..." : "Enter admin password..."}
                value={authPasswordInput}
                onChange={(e) => setAuthPasswordInput(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: "6px",
                  backgroundColor: "#EDE0C4",
                  border: "1px solid rgba(44, 26, 14, 0.2)",
                  color: "#2C1A0E",
                  fontSize: "1rem",
                  outline: "none",
                }}
              />

              {authError && (
                <div
                  style={{
                    color: "#c0392b",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    backgroundColor: "rgba(192, 57, 43, 0.1)",
                    padding: "8px 12px",
                    borderRadius: "4px",
                  }}
                >
                  {authError}
                </div>
              )}

              <div className="flex gap-3 justify-end mt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsAuthModalOpen(false);
                    setAuthPasswordInput("");
                    setAuthError(null);
                  }}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "4px",
                    border: "1px solid rgba(44, 26, 14, 0.2)",
                    backgroundColor: "transparent",
                    color: "#6B5340",
                    fontSize: "0.9rem",
                    cursor: "pointer",
                  }}
                  className="hover:bg-amber-100 transition-colors"
                >
                  {t.products.cancel}
                </button>
                <button
                  type="submit"
                  disabled={isVerifying}
                  style={{
                    padding: "8px 20px",
                    borderRadius: "4px",
                    backgroundColor: "#B85C38",
                    color: "#F4ECD8",
                    fontSize: "0.9rem",
                    fontWeight: 600,
                    border: "none",
                    cursor: "pointer",
                  }}
                  className="hover:brightness-110 disabled:opacity-50 transition-all flex items-center gap-2"
                >
                  {isVerifying && (
                    <span className="w-4 h-4 border-2 border-[#F4ECD8] border-t-transparent rounded-full animate-spin"></span>
                  )}
                  {t.products.confirm}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
