import { useState, useRef } from "react";
import { Plus, Pencil, Trash2, X, Check, Package, ZoomIn, ChevronUp, ChevronDown, Upload, ImageIcon, Minus, ShoppingCart } from "lucide-react";
import { useLanguage } from "../i18n/LanguageContext";
import { getLocalizedProduct } from "../i18n/translations";
import { uploadProductImage } from "../../lib/api";
import { compressImageForUpload, optimizeProductImageUrl, validateImageFile } from "../../lib/images";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "./ui/dialog";

export type Category = "mate" | "bombilla" | "gourd" | "other";

export const PRODUCT_CATEGORIES = ["mate", "bombilla", "gourd", "other"] as const;
export const FILTER_OPTIONS = ["all", ...PRODUCT_CATEGORIES] as const;

export interface Product {
  id: string;
  name: string;
  description: string;
  nameAr?: string;
  descriptionAr?: string;
  image_url?: string;
  price: number;
  category: Category;
  sold_out?: boolean;
}

interface ProductsSectionProps {
  products: Product[];
  onAdd: (p: Omit<Product, "id">) => Promise<void>;
  onEdit: (p: Product) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onReorder: (order: string[]) => Promise<void>;
  onAddToCart: (productId: string, qty: number) => void;
  isAdmin: boolean;
}

const categoryEmoji: Record<Category, string> = {
  mate: "🌿",
  bombilla: "🥤",
  gourd: "🫙",
  other: "📦",
};

const EMPTY_FORM = { name: "", description: "", price: 0, category: "mate" as Category, image_url: "", sold_out: false };

function SoldOutOverlay() {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(192, 57, 43, 0.82)",
        zIndex: 2,
        pointerEvents: "none",
        gap: "4px",
      }}
    >
      <span
        style={{
          color: "#F4ECD8",
          fontWeight: 800,
          fontSize: "1.15rem",
          letterSpacing: "0.12em",
          textTransform: "uppercase",
        }}
      >
        SOLD OUT
      </span>
      <span
        style={{
          color: "#F4ECD8",
          fontWeight: 700,
          fontSize: "1rem",
          fontFamily: "'Cairo', sans-serif",
        }}
      >
        نفذت الكمية
      </span>
    </div>
  );
}

export function ProductsSection({ products, onAdd, onEdit, onDelete, onReorder, onAddToCart, isAdmin }: ProductsSectionProps) {
  const [filter, setFilter] = useState<Category | "all">("all");
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<Omit<Product, "id">>(EMPTY_FORM);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isReordering, setIsReordering] = useState(false);
  const [togglingSoldOut, setTogglingSoldOut] = useState<string | null>(null);
  const [enlargedProduct, setEnlargedProduct] = useState<Product | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [addQty, setAddQty] = useState<Record<string, number>>({});
  const [justAdded, setJustAdded] = useState<string | null>(null);
  const { t, language, isRTL } = useLanguage();
  const fontFamily = isRTL ? "'Cairo', sans-serif" : "'Lato', sans-serif";
  const serifFamily = isRTL ? "'Cairo', sans-serif" : "'Playfair Display', serif";

  const categoryLabels = t.products.categories;

  const filtered = filter === "all" ? products : products.filter((p) => p.category === filter);

  const openAdd = () => {
    setEditingProduct(null);
    setForm(EMPTY_FORM);
    setIsUploadingImage(false);
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
      category: p.category,
      sold_out: p.sold_out ?? false,
    });
    setShowForm(true);
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validationError = validateImageFile(file);
    if (validationError) {
      window.alert(`${t.products.invalidImage}: ${validationError}`);
      e.target.value = "";
      return;
    }

    setIsUploadingImage(true);
    try {
      const compressed = await compressImageForUpload(file);
      const url = await uploadProductImage(compressed);
      setForm((prev) => ({ ...prev, image_url: url }));
    } catch {
      window.alert(t.products.uploadFailed);
    } finally {
      setIsUploadingImage(false);
      e.target.value = "";
    }
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

  const moveProduct = async (id: string, direction: "up" | "down") => {
    if (isReordering) return;
    const idx = filtered.findIndex((p) => p.id === id);
    if (idx === -1) return;
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= filtered.length) return;

    const globalIds = products.map((p) => p.id);
    const posA = globalIds.indexOf(filtered[idx].id);
    const posB = globalIds.indexOf(filtered[swapIdx].id);
    [globalIds[posA], globalIds[posB]] = [globalIds[posB], globalIds[posA]];

    setIsReordering(true);
    try {
      await onReorder(globalIds);
    } catch {
      window.alert("Could not reorder products. Please try again.");
    } finally {
      setIsReordering(false);
    }
  };

  const getAddQty = (productId: string) => addQty[productId] ?? 1;

  const setAddQtyFor = (productId: string, qty: number) => {
    setAddQty((prev) => ({ ...prev, [productId]: Math.max(1, qty) }));
  };

  const handleAddToBulk = (productId: string) => {
    const qty = getAddQty(productId);
    onAddToCart(productId, qty);
    setJustAdded(productId);
    window.setTimeout(() => setJustAdded((current) => (current === productId ? null : current)), 1500);
  };

  const handleImageClick = async (p: Product) => {
    if (isAdmin) {
      if (togglingSoldOut === p.id) return;
      setTogglingSoldOut(p.id);
      try {
        await onEdit({ ...p, sold_out: !p.sold_out });
      } catch {
        window.alert("Could not update sold-out status. Please try again.");
      } finally {
        setTogglingSoldOut(null);
      }
      return;
    }
    if (p.image_url) {
      setEnlargedProduct(p);
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
            {FILTER_OPTIONS.map((cat) => (
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
            {filtered.map((p, index) => {
              const localized = getLocalizedProduct(p, language);
              const cardImageSrc = optimizeProductImageUrl(p.image_url, 600);
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
                  <div
                    style={{ 
                    height: "220px", 
                    backgroundColor: p.image_url ? "#FFFFFF" : "#2D5016", 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center", 
                    overflow: "hidden",
                    padding: p.image_url ? "12px" : "0",
                    borderBottom: "1px solid rgba(44, 26, 14, 0.08)",
                    position: "relative",
                  }}
                  >
                    {p.image_url ? (
                      <button
                        type="button"
                        onClick={() => handleImageClick(p)}
                        aria-label={isAdmin ? (p.sold_out ? t.products.markInStock : t.products.markSoldOut) : t.products.enlargeImage}
                        title={isAdmin ? (p.sold_out ? t.products.markInStock : t.products.markSoldOut) : t.products.enlargeImage}
                        style={{
                          border: "none",
                          background: "transparent",
                          padding: 0,
                          cursor: isAdmin || p.image_url ? "pointer" : "default",
                          width: "100%",
                          height: "100%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          position: "relative",
                          opacity: togglingSoldOut === p.id ? 0.6 : 1,
                        }}
                        onMouseOver={(e) => {
                          if (isAdmin || p.sold_out) return;
                          const overlay = e.currentTarget.querySelector("[data-zoom-overlay]") as HTMLElement | null;
                          if (overlay) overlay.style.opacity = "1";
                        }}
                        onMouseOut={(e) => {
                          const overlay = e.currentTarget.querySelector("[data-zoom-overlay]") as HTMLElement | null;
                          if (overlay) overlay.style.opacity = "0";
                        }}
                      >
                        <img
                          src={cardImageSrc}
                          alt={localized.name}
                          loading="lazy"
                          decoding="async"
                          style={{
                            maxWidth: "100%",
                            maxHeight: "100%",
                            objectFit: "contain",
                            transition: "transform 0.2s",
                            filter: p.sold_out ? "grayscale(0.4)" : "none",
                          }}
                        />
                        {!isAdmin && !p.sold_out && (
                        <span
                          data-zoom-overlay
                          style={{
                            position: "absolute",
                            inset: 0,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: "rgba(44, 26, 14, 0.25)",
                            opacity: 0,
                            transition: "opacity 0.2s",
                            pointerEvents: "none",
                          }}
                        >
                          <ZoomIn size={32} color="#F4ECD8" strokeWidth={2} />
                        </span>
                        )}
                        {p.sold_out && <SoldOutOverlay />}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleImageClick(p)}
                        aria-label={isAdmin ? (p.sold_out ? t.products.markInStock : t.products.markSoldOut) : localized.name}
                        title={isAdmin ? (p.sold_out ? t.products.markInStock : t.products.markSoldOut) : undefined}
                        style={{
                          border: "none",
                          background: "transparent",
                          padding: 0,
                          cursor: isAdmin ? "pointer" : "default",
                          width: "100%",
                          height: "100%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          position: "relative",
                          opacity: togglingSoldOut === p.id ? 0.6 : 1,
                        }}
                      >
                        <span style={{ fontSize: "4.5rem", filter: p.sold_out ? "grayscale(0.4)" : "none" }}>
                          {categoryEmoji[p.category]}
                        </span>
                        {p.sold_out && <SoldOutOverlay />}
                      </button>
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

                    {!p.sold_out && (
                      <div
                        className="flex items-center gap-2 mt-3 pt-3"
                        style={{ borderTop: "1px solid rgba(44,26,14,0.1)" }}
                      >
                        <span style={{ color: "#6B5340", fontSize: "0.78rem", flexShrink: 0 }}>
                          {t.products.qty}:
                        </span>
                        <button
                          type="button"
                          onClick={() => setAddQtyFor(p.id, getAddQty(p.id) - 1)}
                          aria-label={t.products.decreaseQty}
                          style={{
                            width: "28px",
                            height: "28px",
                            borderRadius: "50%",
                            border: "1px solid rgba(44,26,14,0.25)",
                            backgroundColor: "transparent",
                            color: "#6B5340",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          <Minus size={13} />
                        </button>
                        <span
                          style={{
                            minWidth: "24px",
                            textAlign: "center",
                            color: "#2C1A0E",
                            fontWeight: 700,
                            fontSize: "0.95rem",
                          }}
                        >
                          {getAddQty(p.id)}
                        </span>
                        <button
                          type="button"
                          onClick={() => setAddQtyFor(p.id, getAddQty(p.id) + 1)}
                          aria-label={t.products.increaseQty}
                          style={{
                            width: "28px",
                            height: "28px",
                            borderRadius: "50%",
                            border: "1px solid rgba(44,26,14,0.25)",
                            backgroundColor: "transparent",
                            color: "#6B5340",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          <Plus size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAddToBulk(p.id)}
                          style={{
                            marginLeft: "auto",
                            display: "flex",
                            alignItems: "center",
                            gap: "5px",
                            padding: "6px 12px",
                            border: "none",
                            borderRadius: "4px",
                            backgroundColor: justAdded === p.id ? "#2D5016" : "#B85C38",
                            color: "#F4ECD8",
                            fontSize: "0.8rem",
                            fontWeight: 700,
                            cursor: "pointer",
                            flexShrink: 0,
                          }}
                        >
                          <ShoppingCart size={14} />
                          {justAdded === p.id ? t.products.addedToOrder : t.bulk.addToOrder}
                        </button>
                      </div>
                    )}

                    {isAdmin && (
                      <div className="flex flex-wrap gap-2 mt-4 pt-3" style={{ borderTop: "1px solid rgba(44,26,14,0.1)" }}>
                        <button
                          onClick={() => moveProduct(p.id, "up")}
                          disabled={index === 0 || isReordering}
                          aria-label={t.products.moveUp}
                          title={t.products.moveUp}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: "5px 8px",
                            border: "1px solid rgba(44,26,14,0.25)",
                            borderRadius: "4px",
                            backgroundColor: "transparent",
                            color: index === 0 ? "#D4C5A0" : "#6B5340",
                            cursor: index === 0 || isReordering ? "not-allowed" : "pointer",
                            opacity: index === 0 || isReordering ? 0.5 : 1,
                          }}
                        >
                          <ChevronUp size={15} />
                        </button>
                        <button
                          onClick={() => moveProduct(p.id, "down")}
                          disabled={index === filtered.length - 1 || isReordering}
                          aria-label={t.products.moveDown}
                          title={t.products.moveDown}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: "5px 8px",
                            border: "1px solid rgba(44,26,14,0.25)",
                            borderRadius: "4px",
                            backgroundColor: "transparent",
                            color: index === filtered.length - 1 ? "#D4C5A0" : "#6B5340",
                            cursor: index === filtered.length - 1 || isReordering ? "not-allowed" : "pointer",
                            opacity: index === filtered.length - 1 || isReordering ? 0.5 : 1,
                          }}
                        >
                          <ChevronDown size={15} />
                        </button>
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
                  <option value="other">{categoryLabels.other}</option>
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
                <label style={{ display: "block", color: "#2C1A0E", fontSize: "0.85rem", marginBottom: "6px", fontWeight: 600 }}>
                  {t.products.productImage}
                </label>

                {form.image_url ? (
                  <div
                    style={{
                      position: "relative",
                      marginBottom: "12px",
                      borderRadius: "6px",
                      overflow: "hidden",
                      border: "1px solid rgba(44,26,14,0.15)",
                      backgroundColor: "#FFFFFF",
                      height: "140px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <img
                      src={optimizeProductImageUrl(form.image_url, 400)}
                      alt=""
                      style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
                    />
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, image_url: "" })}
                      style={{
                        position: "absolute",
                        top: "8px",
                        right: "8px",
                        backgroundColor: "#c0392b",
                        color: "#F4ECD8",
                        border: "none",
                        borderRadius: "4px",
                        padding: "4px 8px",
                        fontSize: "0.75rem",
                        cursor: "pointer",
                      }}
                    >
                      {t.products.removeImage}
                    </button>
                  </div>
                ) : (
                  <div
                    style={{
                      marginBottom: "12px",
                      padding: "24px",
                      border: "2px dashed rgba(44,26,14,0.2)",
                      borderRadius: "6px",
                      textAlign: "center",
                      color: "#6B5340",
                      backgroundColor: "#EDE0C4",
                    }}
                  >
                    <ImageIcon size={28} style={{ margin: "0 auto 8px", opacity: 0.5 }} />
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={handleImageFileChange}
                  style={{ display: "none" }}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingImage}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    width: "100%",
                    padding: "10px 12px",
                    marginBottom: "10px",
                    border: "1px solid rgba(44,26,14,0.25)",
                    borderRadius: "4px",
                    backgroundColor: isUploadingImage ? "#D4C5A0" : "#2D5016",
                    color: "#F4ECD8",
                    fontSize: "0.9rem",
                    fontWeight: 600,
                    cursor: isUploadingImage ? "not-allowed" : "pointer",
                  }}
                >
                  <Upload size={16} />
                  {isUploadingImage ? t.products.uploadingImage : t.products.uploadImage}
                </button>

                <p style={{ color: "#6B5340", fontSize: "0.78rem", marginBottom: "6px" }}>{t.products.orPasteUrl}</p>
                <input
                  type="text"
                  value={form.image_url || ""}
                  onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                  placeholder={t.products.imageUrlPlaceholder}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid rgba(44,26,14,0.25)",
                    borderRadius: "4px",
                    backgroundColor: "#EDE0C4",
                    color: "#2C1A0E",
                    fontSize: "0.9rem",
                    boxSizing: "border-box",
                    fontFamily,
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
                disabled={!form.name.trim() || form.price <= 0 || isSaving || isUploadingImage}
                style={{
                  flex: 2,
                  padding: "10px",
                  backgroundColor: form.name.trim() && form.price > 0 && !isUploadingImage ? "#2D5016" : "#D4C5A0",
                  color: "#F4ECD8",
                  border: "none",
                  borderRadius: "4px",
                  cursor: form.name.trim() && form.price > 0 && !isUploadingImage ? "pointer" : "not-allowed",
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

      <Dialog
        open={!!enlargedProduct}
        onOpenChange={(open) => !open && setEnlargedProduct(null)}
      >
        <DialogContent
          className="max-w-3xl border-none p-4 sm:p-6"
          style={{ backgroundColor: "#F4ECD8" }}
        >
          {enlargedProduct && (() => {
            const localized = getLocalizedProduct(enlargedProduct, language);
            return (
              <>
                <DialogTitle
                  style={{
                    fontFamily: serifFamily,
                    color: "#2C1A0E",
                    fontSize: "1.25rem",
                    marginBottom: "12px",
                  }}
                >
                  {localized.name}
                </DialogTitle>
                <div
                  style={{
                    backgroundColor: "#FFFFFF",
                    borderRadius: "8px",
                    padding: "16px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: "200px",
                  }}
                >
                  <img
                    src={optimizeProductImageUrl(enlargedProduct.image_url, 1200)}
                    alt={localized.name}
                    decoding="async"
                    style={{
                      maxWidth: "100%",
                      maxHeight: "75vh",
                      objectFit: "contain",
                    }}
                  />
                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>
    </section>
  );
}
