import { useState } from "react";
import { Plus, Minus, Pencil, Check, X, Trash2 } from "lucide-react";
import type { Product } from "./ProductsSection";
import type { CartItem } from "../../lib/cart";
import { useLanguage, interpolate } from "../i18n/LanguageContext";
import { getLocalizedProduct } from "../i18n/translations";

interface BulkTier {
  minQty: number;
  discountPct: number;
}

interface BulkCalculatorProps {
  products: Product[];
  tiers: BulkTier[];
  cartItems: CartItem[];
  onAddToCart: (productId: string, qty: number) => void;
  onUpdateCartQty: (productId: string, qty: number) => void;
  onRemoveFromCart: (productId: string) => void;
  onUpdateTiers: (tiers: BulkTier[]) => Promise<void>;
  isAdmin: boolean;
}

export function BulkCalculator({
  products,
  tiers,
  cartItems,
  onAddToCart,
  onUpdateCartQty,
  onRemoveFromCart,
  onUpdateTiers,
  isAdmin,
}: BulkCalculatorProps) {
  const [pendingProduct, setPendingProduct] = useState<string>("");
  const [pendingQty, setPendingQty] = useState(1);
  const [editingTiers, setEditingTiers] = useState(false);
  const [draftTiers, setDraftTiers] = useState<BulkTier[]>(tiers);
  const [isSavingTiers, setIsSavingTiers] = useState(false);
  const { t, language, isRTL } = useLanguage();
  const fontFamily = isRTL ? "'Cairo', sans-serif" : "'Lato', sans-serif";
  const serifFamily = isRTL ? "'Cairo', sans-serif" : "'Playfair Display', serif";

  const formatPrice = (amount: number) =>
    language === "ar"
      ? `${amount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })} $`
      : `$${amount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;

  const getDiscount = (quantity: number): number => {
    const applicable = [...tiers]
      .sort((a, b) => b.minQty - a.minQty)
      .find((t) => quantity >= t.minQty);
    return applicable ? applicable.discountPct : 0;
  };

  const totalQty = cartItems.reduce((sum, item) => sum + item.qty, 0);
  const discountPct = getDiscount(totalQty);
  const subtotal = cartItems.reduce((sum, item) => {
    const product = products.find((p) => p.id === item.productId);
    return sum + (product?.price ?? 0) * item.qty;
  }, 0);
  const discounted = subtotal * (1 - discountPct / 100);
  const savings = subtotal - discounted;

  const addToCart = () => {
    if (!pendingProduct) return;
    onAddToCart(pendingProduct, pendingQty);
    setPendingProduct("");
    setPendingQty(1);
  };

  const addDraftTier = () => {
    const lastMin = draftTiers.length > 0 ? Math.max(...draftTiers.map((t) => t.minQty)) : 2;
    setDraftTiers([...draftTiers, { minQty: lastMin + 3, discountPct: 5 }]);
  };

  const removeDraftTier = (idx: number) => {
    setDraftTiers(draftTiers.filter((_, i) => i !== idx));
  };

  const updateDraftTier = (idx: number, field: keyof BulkTier, value: number) => {
    setDraftTiers(draftTiers.map((t, i) => (i === idx ? { ...t, [field]: value } : t)));
  };

  const saveTiers = async () => {
    const valid = draftTiers.filter((t) => t.minQty >= 3 && t.discountPct > 0 && t.discountPct <= 100);
    setIsSavingTiers(true);
    try {
      await onUpdateTiers(valid);
      setEditingTiers(false);
    } catch {
      window.alert("Could not save discount tiers. Please try again.");
    } finally {
      setIsSavingTiers(false);
    }
  };

  const cancelEditTiers = () => {
    setDraftTiers(tiers);
    setEditingTiers(false);
  };

  const sortedTiers = [...tiers].sort((a, b) => a.minQty - b.minQty);

  return (
    <section
      id="bulk"
      style={{
        backgroundColor: "#2D5016",
        fontFamily,
        padding: "80px 0",
      }}
    >
      <div className="max-w-6xl mx-auto px-6">
        <div className="mb-10">
          <p style={{ color: "#c5e87a", fontSize: "0.8rem", letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: "4px" }}>
            {t.bulk.subtitle}
          </p>
          <h2 style={{ fontFamily: serifFamily, color: "#F4ECD8", fontSize: "2rem", fontWeight: 700 }}>
            {t.bulk.title}
          </h2>
          <p style={{ color: "rgba(244,236,216,0.7)", marginTop: "8px", fontSize: "0.92rem" }}>
            {t.bulk.description}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-10">
          <div
            style={{
              backgroundColor: "rgba(244,236,216,0.08)",
              border: "1px solid rgba(197,232,122,0.2)",
              borderRadius: "10px",
              padding: "28px",
            }}
          >
            <h3 style={{ color: "#F4ECD8", fontSize: "1.05rem", fontWeight: 700, marginBottom: "20px" }}>
              {t.bulk.calculator}
            </h3>

            <div className="flex flex-col gap-4">
              <div>
                <label style={{ color: "rgba(244,236,216,0.75)", fontSize: "0.82rem", display: "block", marginBottom: "6px" }}>
                  {t.bulk.selectProduct}
                </label>
                <select
                  value={pendingProduct}
                  onChange={(e) => setPendingProduct(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    backgroundColor: "rgba(244,236,216,0.1)",
                    border: "1px solid rgba(244,236,216,0.2)",
                    borderRadius: "4px",
                    color: "#F4ECD8",
                    fontSize: "0.9rem",
                  }}
                >
                  <option value="" style={{ backgroundColor: "#2D5016" }}>{t.bulk.chooseProduct}</option>
                  {products.map((p) => {
                    const localized = getLocalizedProduct(p, language);
                    return (
                      <option key={p.id} value={p.id} style={{ backgroundColor: "#2D5016" }}>
                        {localized.name} — {formatPrice(p.price)}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label style={{ color: "rgba(244,236,216,0.75)", fontSize: "0.82rem", display: "block", marginBottom: "6px" }}>
                  {t.bulk.quantity}
                </label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setPendingQty(Math.max(1, pendingQty - 1))}
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "50%",
                      backgroundColor: "rgba(244,236,216,0.12)",
                      border: "1px solid rgba(244,236,216,0.2)",
                      color: "#F4ECD8",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Minus size={14} />
                  </button>
                  <input
                    type="number"
                    value={pendingQty}
                    onChange={(e) => setPendingQty(Math.max(1, Number(e.target.value)))}
                    min={1}
                    style={{
                      width: "70px",
                      textAlign: "center",
                      padding: "8px",
                      backgroundColor: "rgba(244,236,216,0.1)",
                      border: "1px solid rgba(244,236,216,0.2)",
                      borderRadius: "4px",
                      color: "#F4ECD8",
                      fontSize: "1rem",
                    }}
                  />
                  <button
                    onClick={() => setPendingQty(pendingQty + 1)}
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "50%",
                      backgroundColor: "rgba(244,236,216,0.12)",
                      border: "1px solid rgba(244,236,216,0.2)",
                      color: "#F4ECD8",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Plus size={14} />
                  </button>
                  <span style={{ color: "rgba(244,236,216,0.6)", fontSize: "0.85rem" }}>{t.bulk.pieces}</span>
                </div>
              </div>

              <button
                onClick={addToCart}
                disabled={!pendingProduct}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                  padding: "10px",
                  backgroundColor: pendingProduct ? "#c5e87a" : "rgba(244,236,216,0.12)",
                  color: pendingProduct ? "#1e3a0f" : "rgba(244,236,216,0.45)",
                  border: "none",
                  borderRadius: "4px",
                  cursor: pendingProduct ? "pointer" : "not-allowed",
                  fontWeight: 700,
                  fontSize: "0.9rem",
                }}
              >
                <Plus size={14} /> {t.bulk.addToOrder}
              </button>

              {cartItems.length > 0 ? (
                <div className="flex flex-col gap-3">
                  <h4 style={{ color: "#F4ECD8", fontSize: "0.9rem", fontWeight: 700, marginTop: "4px" }}>
                    {t.bulk.yourOrder}
                  </h4>
                  {cartItems.map((item) => {
                    const product = products.find((p) => p.id === item.productId);
                    if (!product) return null;
                    const localized = getLocalizedProduct(product, language);
                    const lineTotal = product.price * item.qty;

                    return (
                      <div
                        key={item.productId}
                        style={{
                          padding: "12px",
                          backgroundColor: "rgba(244,236,216,0.05)",
                          border: "1px solid rgba(244,236,216,0.12)",
                          borderRadius: "6px",
                        }}
                      >
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ color: "#F4ECD8", fontSize: "0.88rem", fontWeight: 600 }}>
                              {localized.name}
                            </p>
                            <p style={{ color: "rgba(244,236,216,0.55)", fontSize: "0.78rem", marginTop: "2px" }}>
                              {formatPrice(product.price)} × {item.qty}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span style={{ color: "#F4ECD8", fontSize: "0.88rem", fontWeight: 600 }}>
                              {formatPrice(lineTotal)}
                            </span>
                            <button
                              onClick={() => onRemoveFromCart(item.productId)}
                              aria-label={t.bulk.removeItem}
                              style={{
                                color: "rgba(244,236,216,0.45)",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                              }}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onUpdateCartQty(item.productId, item.qty - 1)}
                            style={{
                              width: "28px",
                              height: "28px",
                              borderRadius: "50%",
                              backgroundColor: "rgba(244,236,216,0.1)",
                              border: "1px solid rgba(244,236,216,0.2)",
                              color: "#F4ECD8",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <Minus size={12} />
                          </button>
                          <span style={{ color: "#F4ECD8", fontSize: "0.85rem", minWidth: "24px", textAlign: "center" }}>
                            {item.qty}
                          </span>
                          <button
                            onClick={() => onUpdateCartQty(item.productId, item.qty + 1)}
                            style={{
                              width: "28px",
                              height: "28px",
                              borderRadius: "50%",
                              backgroundColor: "rgba(244,236,216,0.1)",
                              border: "1px solid rgba(244,236,216,0.2)",
                              color: "#F4ECD8",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  <div
                    style={{
                      marginTop: "4px",
                      padding: "16px",
                      backgroundColor: discountPct > 0 ? "rgba(197,232,122,0.1)" : "rgba(244,236,216,0.05)",
                      border: `1px solid ${discountPct > 0 ? "rgba(197,232,122,0.3)" : "rgba(244,236,216,0.1)"}`,
                      borderRadius: "6px",
                    }}
                  >
                    <div className="flex justify-between mb-2">
                      <span style={{ color: "rgba(244,236,216,0.7)", fontSize: "0.85rem" }}>
                        {interpolate(t.bulk.totalPieces, { qty: totalQty })}
                      </span>
                      <span style={{ color: "#F4ECD8" }}>{totalQty}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span style={{ color: "rgba(244,236,216,0.7)", fontSize: "0.85rem" }}>
                        {interpolate(t.bulk.subtotal, { qty: totalQty })}
                      </span>
                      <span style={{ color: "#F4ECD8" }}>{formatPrice(subtotal)}</span>
                    </div>
                    {discountPct > 0 && (
                      <div className="flex justify-between mb-2">
                        <span style={{ color: "#c5e87a", fontSize: "0.85rem" }}>
                          {interpolate(t.bulk.bulkDiscount, { pct: discountPct })}
                        </span>
                        <span style={{ color: "#c5e87a" }}>− {formatPrice(savings)}</span>
                      </div>
                    )}
                    <div
                      style={{
                        borderTop: "1px solid rgba(244,236,216,0.15)",
                        paddingTop: "10px",
                        marginTop: "8px",
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <span style={{ color: "#F4ECD8", fontWeight: 700 }}>{t.bulk.total}</span>
                      <span
                        style={{
                          fontFamily: serifFamily,
                          fontSize: "1.25rem",
                          color: discountPct > 0 ? "#c5e87a" : "#F4ECD8",
                          fontWeight: 700,
                        }}
                      >
                        {formatPrice(discounted)}
                      </span>
                    </div>
                    {discountPct === 0 && totalQty < 3 && (
                      <p style={{ color: "rgba(244,236,216,0.5)", fontSize: "0.78rem", marginTop: "8px" }}>
                        {t.bulk.unlockDiscount}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <p style={{ color: "rgba(244,236,216,0.5)", fontSize: "0.85rem", marginTop: "4px" }}>
                  {t.bulk.emptyCart}
                </p>
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-5">
              <h3 style={{ color: "#F4ECD8", fontSize: "1.05rem", fontWeight: 700 }}>{t.bulk.discountTiers}</h3>
              {isAdmin && !editingTiers && (
                <button
                  onClick={() => { setDraftTiers([...tiers]); setEditingTiers(true); }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                    padding: "5px 12px",
                    backgroundColor: "rgba(244,236,216,0.1)",
                    border: "1px solid rgba(244,236,216,0.25)",
                    borderRadius: "4px",
                    color: "#F4ECD8",
                    fontSize: "0.8rem",
                    cursor: "pointer",
                  }}
                >
                  <Pencil size={12} /> {t.bulk.editTiers}
                </button>
              )}
            </div>

            {!editingTiers ? (
              <div className="flex flex-col gap-3">
                {sortedTiers.map((tier) => (
                  <div
                    key={tier.minQty}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "14px 18px",
                      backgroundColor: "rgba(244,236,216,0.07)",
                      border: "1px solid rgba(197,232,122,0.15)",
                      borderRadius: "6px",
                    }}
                  >
                    <div>
                      <p style={{ color: "#F4ECD8", fontWeight: 700 }}>
                        {interpolate(t.bulk.piecesMin, { qty: tier.minQty })}
                      </p>
                      <p style={{ color: "rgba(244,236,216,0.55)", fontSize: "0.8rem" }}>{t.bulk.minOrderQty}</p>
                    </div>
                    <div
                      style={{
                        backgroundColor: "rgba(197,232,122,0.15)",
                        border: "1px solid rgba(197,232,122,0.3)",
                        borderRadius: "20px",
                        padding: "4px 14px",
                        color: "#c5e87a",
                        fontWeight: 700,
                        fontSize: "1rem",
                      }}
                    >
                      {interpolate(t.bulk.off, { pct: tier.discountPct })}
                    </div>
                  </div>
                ))}
                {sortedTiers.length === 0 && (
                  <p style={{ color: "rgba(244,236,216,0.5)", fontSize: "0.9rem" }}>
                    {t.bulk.noTiers}{isAdmin ? t.bulk.noTiersAdmin : ""}
                  </p>
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {draftTiers.map((tier, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      padding: "12px 16px",
                      backgroundColor: "rgba(244,236,216,0.07)",
                      border: "1px solid rgba(244,236,216,0.2)",
                      borderRadius: "6px",
                    }}
                  >
                    <div className="flex items-center gap-2 flex-1">
                      <input
                        type="number"
                        value={tier.minQty}
                        min={3}
                        onChange={(e) => updateDraftTier(idx, "minQty", Number(e.target.value))}
                        style={{
                          width: "65px",
                          padding: "6px 8px",
                          backgroundColor: "rgba(244,236,216,0.1)",
                          border: "1px solid rgba(244,236,216,0.2)",
                          borderRadius: "4px",
                          color: "#F4ECD8",
                          fontSize: "0.9rem",
                          textAlign: "center",
                        }}
                      />
                      <span style={{ color: "rgba(244,236,216,0.6)", fontSize: "0.82rem" }}>{t.bulk.piecesArrow}</span>
                      <input
                        type="number"
                        value={tier.discountPct}
                        min={1}
                        max={100}
                        onChange={(e) => updateDraftTier(idx, "discountPct", Number(e.target.value))}
                        style={{
                          width: "55px",
                          padding: "6px 8px",
                          backgroundColor: "rgba(244,236,216,0.1)",
                          border: "1px solid rgba(244,236,216,0.2)",
                          borderRadius: "4px",
                          color: "#c5e87a",
                          fontSize: "0.9rem",
                          textAlign: "center",
                        }}
                      />
                      <span style={{ color: "#c5e87a", fontSize: "0.82rem" }}>%</span>
                    </div>
                    <button
                      onClick={() => removeDraftTier(idx)}
                      style={{ color: "rgba(244,236,216,0.45)", cursor: "pointer", flexShrink: 0 }}
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
                <button
                  onClick={addDraftTier}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "10px",
                    border: "1px dashed rgba(197,232,122,0.35)",
                    borderRadius: "6px",
                    backgroundColor: "transparent",
                    color: "#c5e87a",
                    cursor: "pointer",
                    fontSize: "0.85rem",
                    justifyContent: "center",
                  }}
                >
                  <Plus size={14} /> {t.bulk.addTier}
                </button>
                <div className="flex gap-3">
                  <button
                    onClick={cancelEditTiers}
                    style={{
                      flex: 1,
                      padding: "9px",
                      border: "1px solid rgba(244,236,216,0.2)",
                      borderRadius: "4px",
                      backgroundColor: "transparent",
                      color: "rgba(244,236,216,0.7)",
                      cursor: "pointer",
                      fontSize: "0.85rem",
                    }}
                  >
                    {t.products.cancel}
                  </button>
                  <button
                    onClick={saveTiers}
                    disabled={isSavingTiers}
                    style={{
                      flex: 2,
                      padding: "9px",
                      backgroundColor: isSavingTiers ? "#D4C5A0" : "#c5e87a",
                      color: "#1e3a0f",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontWeight: 700,
                      fontSize: "0.85rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                    }}
                  >
                    <Check size={14} /> {isSavingTiers ? "…" : t.bulk.saveTiers}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
