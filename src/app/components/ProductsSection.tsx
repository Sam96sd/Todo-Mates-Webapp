import { useState } from "react";
import { Plus, Pencil, Trash2, X, Check, Package } from "lucide-react";
import { useLanguage } from "../i18n/LanguageContext";
import { getLocalizedProduct } from "../i18n/translations";

export type Category = "mate" | "bombilla" | "gourd";

export interface Product {
  id: string;
  name: string;
  description: string;
  nameAr?: string;
  descriptionAr?: string;
  image_url?: string;
  price: number;
  category: Category;
}

interface ProductsSectionProps {
  products: Product[];
  onAdd: (p: Omit<Product, "id">) => Promise<void>;
  onEdit: (p: Product) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  isAdmin: boolean;
}

const categoryEmoji: Record<Category, string> = {
  mate: "🌿",
  bombilla: "🥤",
  gourd: "🫙",
};

const EMPTY_FORM = { name: "", description: "", price: 0, category: "mate" as Category, image_url: "" };

export function ProductsSection({ products, onAdd, onEdit, onDelete, isAdmin }: ProductsSectionProps) {
  const [filter, setFilter] = useState<Category | "all">("all");
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<Omit<Product, "id">>(EMPTY_FORM);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { t, language, isRTL } = useLanguage();
  const fontFamily = isRTL ? "'Cairo', sans-serif" : "'Lato', sans-serif";
  const serifFamily = isRTL ? "'Cairo', sans-serif" : "'Playfair Display', serif";

  const categoryLabels = t.products.categories;

  const filtered = filter === "all" ? products : products.filter((p) => p.category === filter);

  const openAdd = () => {
    setEditingProduct(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  };

  const openEdit = (p: Product) => {
    setEditingProduct(p);
    setForm({ 
      name: p.name, 
      description: p.description, 
      nameAr: p.nameAr || "", 
      descriptionAr: p.descriptionAr || "", 
      image_url: p.image_url || "",
      price: p.price, 
      category: p.category 
    });
    setShowForm(true);
  };

  const handleSubmit = async () => {
    if (!form.name.trim() || form.price <= 0 || isSaving) return;
    setIsSaving(true);
    try {
      if (editingProduct) {
        await onEdit({ ...editingProduct, ...form });
      } else {
        await onAdd(form);
      }
      setShowForm(false);
      setForm(EMPTY_FORM);
      setEditingProduct(null);
    } catch {
      window.alert("Could not save product. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (deleteConfirm !== id) {
      setDeleteConfirm(id);
      setTimeout(() => setDeleteConfirm(null), 3000);
      return;
    }
    try {
      await onDelete(id);
      setDeleteConfirm(null);
    } catch {
      window.alert("Could not delete product. Please try again.");
      setDeleteConfirm(null);
    }
  };

  return (
    <section
      id="products"
      style={{ backgroundColor: "#F4ECD8", fontFamily, padding: "80px 0" }}
    >
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
          <div>
            <p style={{ color: "#B85C38", fontSize: "0.8rem", letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: "4px" }}>
              {t.products.collection}
            </p>
            <h2 style={{ fontFamily: serifFamily, color: "#2C1A0E", fontSize: "2rem", fontWeight: 700 }}>
              {t.products.title}
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {(["all", "mate", "bombilla", "gourd"] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                style={{
                  padding: "6px 16px",
                  borderRadius: "20px",
                  border: "1px solid",
                  borderColor: filter === cat ? "#2D5016" : "rgba(44,26,14,0.25)",
                  backgroundColor: filter === cat ? "#2D5016" : "transparent",
                  color: filter === cat ? "#F4ECD8" : "#6B5340",
                  fontSize: "0.82rem",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                {cat === "all" ? t.products.all : categoryLabels[cat]}
              </button>
            ))}
            {isAdmin && (
              <button
                onClick={openAdd}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "8px 18px",
                  backgroundColor: "#B85C38",
                  color: "#F4ECD8",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "0.85rem",
                  fontWeight: 700,
                }}
              >
                <Plus size={15} /> {t.products.addProduct}
              </button>
            )}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <Package size={40} style={{ color: "#D4C5A0", margin: "0 auto 12px" }} />
            <p style={{ color: "#6B5340" }}>
              {t.products.noProducts} {isAdmin ? t.products.addFirst : ""}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((p) => {
              const localized = getLocalizedProduct(p, language);
              return (
                <div
                  key={p.id}
                  style={{
                    backgroundColor: "#EDE0C4",
                    border: "1px solid rgba(44,26,14,0.12)",
                    borderRadius: "8px",
                    overflow: "hidden",
                    transition: "box-shadow 0.2s",
                    boxShadow: "0 1px 4px rgba(44,26,14,0.08)",
                  }}
                  onMouseOver={(e) =>
                    ((e.currentTarget as HTMLElement).style.boxShadow = "0 4px 16px rgba(44,26,14,0.15)")
                  }
                  onMouseOut={(e) =>
                    ((e.currentTarget as HTMLElement).style.boxShadow = "0 1px 4px rgba(44,26,14,0.08)")
                  }
                >
                  <div style={{ 
                    height: "220px", 
                    backgroundColor: p.image_url ? "#FFFFFF" : "#2D5016", 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center", 
                    overflow: "hidden",
                    padding: p.image_url ? "12px" : "0",
                    borderBottom: "1px solid rgba(44, 26, 14, 0.08)"
                  }}>
                    {p.image_url ? (
                      <img 
                        src={p.image_url} 
                        alt={localized.name} 
                        style={{
                          maxWidth: "100%",
                          maxHeight: "100%",
                          objectFit: "contain"
                        }}
                      />
                    ) : (
                      <span style={{ fontSize: "4.5rem" }}>
                        {categoryEmoji[p.category]}
                      </span>
                    )}
                  </div>
                  <div style={{ padding: "18px" }}>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <span
                          style={{
                            fontSize: "0.7rem",
                            color: "#B85C38",
                            textTransform: "uppercase",
                            letterSpacing: "0.1em",
                          }}
                        >
                          {categoryLabels[p.category]}
                        </span>
                        <h3
                          style={{
                            fontFamily: serifFamily,
                            fontSize: "1.1rem",
                            color: "#2C1A0E",
                            fontWeight: 600,
                            marginTop: "2px",
                          }}
                        >
                          {localized.name}
                        </h3>
                      </div>
                      <p
                        style={{
                          fontFamily: serifFamily,
                          fontSize: "1.15rem",
                          color: "#2D5016",
                          fontWeight: 700,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {language === "ar" ? `${p.price.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })} $` : `$${p.price.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`}
                      </p>
                    </div>
                    <p style={{ color: "#6B5340", fontSize: "0.88rem", lineHeight: 1.6 }}>{localized.description}</p>

                    {isAdmin && (
                      <div className="flex gap-2 mt-4 pt-3" style={{ borderTop: "1px solid rgba(44,26,14,0.1)" }}>
                        <button
                          onClick={() => openEdit(p)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                            padding: "5px 12px",
                            border: "1px solid rgba(44,26,14,0.25)",
                            borderRadius: "4px",
                            backgroundColor: "transparent",
                            color: "#6B5340",
                            fontSize: "0.8rem",
                            cursor: "pointer",
                          }}
                        >
                          <Pencil size={13} /> {t.products.edit}
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                            padding: "5px 12px",
                            border: `1px solid ${deleteConfirm === p.id ? "#c0392b" : "rgba(192,57,43,0.3)"}`,
                            borderRadius: "4px",
                            backgroundColor: deleteConfirm === p.id ? "#c0392b" : "transparent",
                            color: deleteConfirm === p.id ? "#F4ECD8" : "#c0392b",
                            fontSize: "0.8rem",
                            cursor: "pointer",
                            transition: "all 0.2s",
                          }}
                        >
                          {deleteConfirm === p.id ? <><Check size={13} /> {t.products.confirm}</> : <><Trash2 size={13} /> {t.products.delete}</>}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showForm && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(44,26,14,0.55)",
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
          }}
          onClick={(e) => e.target === e.currentTarget && setShowForm(false)}
        >
          <div
            style={{
              backgroundColor: "#F4ECD8",
              borderRadius: "10px",
              padding: "24px 32px",
              width: "100%",
              maxWidth: "500px",
              maxHeight: "90vh",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 20px 60px rgba(44, 26, 14, 0.35)",
              boxSizing: "border-box"
            }}
          >
            <div className="flex items-center justify-between mb-4 flex-shrink-0">
              <h3
                style={{
                  fontFamily: serifFamily,
                  fontSize: "1.3rem",
                  color: "#2C1A0E",
                  fontWeight: 700,
                }}
              >
                {editingProduct ? t.products.editProduct : t.products.addProduct}
              </h3>
              <button onClick={() => setShowForm(false)} style={{ color: "#6B5340", cursor: "pointer" }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ overflowY: "auto", flex: 1, paddingRight: "8px" }} className="flex flex-col gap-4 pr-1">
              <div>
                <label style={{ display: "block", color: "#2C1A0E", fontSize: "0.85rem", marginBottom: "6px", fontWeight: 600 }}>
                  {t.products.category}
                </label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value as Category })}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid rgba(44,26,14,0.25)",
                    borderRadius: "4px",
                    backgroundColor: "#EDE0C4",
                    color: "#2C1A0E",
                    fontSize: "0.9rem",
                  }}
                >
                  <option value="mate">{categoryLabels.mate}</option>
                  <option value="bombilla">{categoryLabels.bombilla}</option>
                  <option value="gourd">{categoryLabels.gourd}</option>
                </select>
              </div>

              <div style={{ display: "flex", gap: "12px" }}>
                {/* English Product Name Column */}
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", color: "#2C1A0E", fontSize: "0.85rem", marginBottom: "6px", fontWeight: 700 }}>
                    {t.products.productName} *
                  </label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder={t.products.productNamePlaceholder}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      border: "1px solid rgba(44,26,14,0.25)",
                      borderRadius: "4px",
                      backgroundColor: "#EDE0C4",
                      color: "#2C1A0E",
                      fontSize: "0.9rem",
                      boxSizing: "border-box"
                    }}
                  />
                </div>

                {/* Arabic Product Name Column */}
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", color: "#2C1A0E", fontSize: "0.85rem", marginBottom: "6px", fontWeight: 700 }}>
                    اسم المنتج (AR)
                  </label>
                  <input
                    type="text"
                    value={form.nameAr || ''}
                    onChange={(e) => setForm({ ...form, nameAr: e.target.value })}
                    placeholder="...أدخل اسم المنتج باللغة العربية"
                    dir="rtl"
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      border: "1px solid rgba(44,26,14,0.25)",
                      borderRadius: "4px",
                      backgroundColor: "#EDE0C4",
                      color: "#2C1A0E",
                      fontSize: "0.9rem",
                      boxSizing: "border-box",
                      textAlign: "right"
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", color: "#2C1A0E", fontSize: "0.85rem", marginBottom: "6px", fontWeight: 600 }}>
                  {t.products.description}
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder={t.products.descriptionPlaceholder}
                  rows={3}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid rgba(44,26,14,0.25)",
                    borderRadius: "4px",
                    backgroundColor: "#EDE0C4",
                    color: "#2C1A0E",
                    fontSize: "0.9rem",
                    resize: "vertical",
                    boxSizing: "border-box",
                    fontFamily,
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", color: "#2C1A0E", fontSize: "0.85rem", marginBottom: "6px", fontWeight: 700 }}>
                  الوصف (AR)
                </label>
                <textarea
                  value={form.descriptionAr || ''}
                  onChange={(e) => setForm({ ...form, descriptionAr: e.target.value })}
                  placeholder="أدخل وصف المنتج باللغة العربية..."
                  rows={3}
                  dir="rtl"
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid rgba(44,26,14,0.25)",
                    borderRadius: "4px",
                    backgroundColor: "#EDE0C4",
                    color: "#2C1A0E",
                    fontSize: "0.9rem",
                    resize: "vertical",
                    boxSizing: "border-box",
                    fontFamily,
                    textAlign: "right"
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", color: "#2C1A0E", fontSize: "0.85rem", marginBottom: "6px", fontWeight: 600 }}>
                  {t.products.price}
                </label>
                <input
                  type="number"
                  step="any"
                  value={form.price || ""}
                  onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                  placeholder={t.products.pricePlaceholder}
                  min={0}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid rgba(44,26,14,0.25)",
                    borderRadius: "4px",
                    backgroundColor: "#EDE0C4",
                    color: "#2C1A0E",
                    fontSize: "0.9rem",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", color: "#2C1A0E", fontSize: "0.85rem", marginBottom: "6px", fontWeight: 700 }}>
                  رابط صورة المنتج (Image URL)
                </label>
                <input
                  type="text"
                  value={form.image_url || ''}
                  onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                  placeholder="https://example.com/image.png"
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid rgba(44,26,14,0.25)",
                    borderRadius: "4px",
                    backgroundColor: "#EDE0C4",
                    color: "#2C1A0E",
                    fontSize: "0.9rem",
                    boxSizing: "border-box",
                    fontFamily
                  }}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-4 pt-3 flex-shrink-0" style={{ borderTop: "1px solid rgba(44, 26, 14, 0.12)" }}>
              <button
                onClick={() => setShowForm(false)}
                style={{
                  flex: 1,
                  padding: "10px",
                  border: "1px solid rgba(44,26,14,0.25)",
                  borderRadius: "4px",
                  backgroundColor: "transparent",
                  color: "#6B5340",
                  cursor: "pointer",
                  fontSize: "0.9rem",
                }}
              >
                {t.products.cancel}
              </button>
              <button
                onClick={handleSubmit}
                disabled={!form.name.trim() || form.price <= 0 || isSaving}
                style={{
                  flex: 2,
                  padding: "10px",
                  backgroundColor: form.name.trim() && form.price > 0 ? "#2D5016" : "#D4C5A0",
                  color: "#F4ECD8",
                  border: "none",
                  borderRadius: "4px",
                  cursor: form.name.trim() && form.price > 0 ? "pointer" : "not-allowed",
                  fontWeight: 700,
                  fontSize: "0.9rem",
                }}
              >
                {isSaving ? "…" : editingProduct ? t.products.saveChanges : t.products.addProduct}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
