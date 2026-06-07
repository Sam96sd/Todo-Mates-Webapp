import { useState } from "react";
import { Plus, Minus, Pencil, Check, X } from "lucide-react";
import type { Product } from "./ProductsSection";

interface BulkTier {
  minQty: number;
  discountPct: number;
}

interface BulkCalculatorProps {
  products: Product[];
  tiers: BulkTier[];
  onUpdateTiers: (tiers: BulkTier[]) => void;
  isAdmin: boolean;
}

export function BulkCalculator({ products, tiers, onUpdateTiers, isAdmin }: BulkCalculatorProps) {
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [qty, setQty] = useState(3);
  const [editingTiers, setEditingTiers] = useState(false);
  const [draftTiers, setDraftTiers] = useState<BulkTier[]>(tiers);

  const product = products.find((p) => p.id === selectedProduct);

  const getDiscount = (quantity: number): number => {
    const applicable = [...tiers]
      .sort((a, b) => b.minQty - a.minQty)
      .find((t) => quantity >= t.minQty);
    return applicable ? applicable.discountPct : 0;
  };

  const discountPct = getDiscount(qty);
  const unitPrice = product?.price ?? 0;
  const total = unitPrice * qty;
  const discounted = total * (1 - discountPct / 100);
  const savings = total - discounted;

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

  const saveTiers = () => {
    const valid = draftTiers.filter((t) => t.minQty >= 3 && t.discountPct > 0 && t.discountPct <= 100);
    onUpdateTiers(valid);
    setEditingTiers(false);
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
        fontFamily: "'Lato', sans-serif",
        padding: "80px 0",
      }}
    >
      <div className="max-w-6xl mx-auto px-6">
        <div className="mb-10">
          <p style={{ color: "#c5e87a", fontSize: "0.8rem", letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: "4px" }}>
            Save More Together
          </p>
          <h2 style={{ fontFamily: "'Playfair Display', serif", color: "#F4ECD8", fontSize: "2rem", fontWeight: 700 }}>
            Bulk Purchase Discount
          </h2>
          <p style={{ color: "rgba(244,236,216,0.7)", marginTop: "8px", fontSize: "0.92rem" }}>
            Our prices are fixed — the only way to get a lower price is by ordering in bulk (3+ pieces).
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-10">
          {/* Calculator */}
          <div
            style={{
              backgroundColor: "rgba(244,236,216,0.08)",
              border: "1px solid rgba(197,232,122,0.2)",
              borderRadius: "10px",
              padding: "28px",
            }}
          >
            <h3 style={{ color: "#F4ECD8", fontSize: "1.05rem", fontWeight: 700, marginBottom: "20px" }}>
              Price Calculator
            </h3>

            <div className="flex flex-col gap-4">
              <div>
                <label style={{ color: "rgba(244,236,216,0.75)", fontSize: "0.82rem", display: "block", marginBottom: "6px" }}>
                  Select Product
                </label>
                <select
                  value={selectedProduct}
                  onChange={(e) => setSelectedProduct(e.target.value)}
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
                  <option value="" style={{ backgroundColor: "#2D5016" }}>-- Choose a product --</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id} style={{ backgroundColor: "#2D5016" }}>
                      {p.name} — {p.price.toLocaleString()} SP
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ color: "rgba(244,236,216,0.75)", fontSize: "0.82rem", display: "block", marginBottom: "6px" }}>
                  Quantity
                </label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQty(Math.max(1, qty - 1))}
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
                    value={qty}
                    onChange={(e) => setQty(Math.max(1, Number(e.target.value)))}
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
                    onClick={() => setQty(qty + 1)}
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
                  <span style={{ color: "rgba(244,236,216,0.6)", fontSize: "0.85rem" }}>pieces</span>
                </div>
              </div>

              {/* Result */}
              {product && (
                <div
                  style={{
                    marginTop: "8px",
                    padding: "16px",
                    backgroundColor: discountPct > 0 ? "rgba(197,232,122,0.1)" : "rgba(244,236,216,0.05)",
                    border: `1px solid ${discountPct > 0 ? "rgba(197,232,122,0.3)" : "rgba(244,236,216,0.1)"}`,
                    borderRadius: "6px",
                  }}
                >
                  <div className="flex justify-between mb-2">
                    <span style={{ color: "rgba(244,236,216,0.7)", fontSize: "0.85rem" }}>Unit Price</span>
                    <span style={{ color: "#F4ECD8" }}>{unitPrice.toLocaleString()} SP</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span style={{ color: "rgba(244,236,216,0.7)", fontSize: "0.85rem" }}>Subtotal ({qty} pcs)</span>
                    <span style={{ color: "#F4ECD8" }}>{total.toLocaleString()} SP</span>
                  </div>
                  {discountPct > 0 && (
                    <div className="flex justify-between mb-2">
                      <span style={{ color: "#c5e87a", fontSize: "0.85rem" }}>Bulk Discount ({discountPct}%)</span>
                      <span style={{ color: "#c5e87a" }}>− {savings.toLocaleString()} SP</span>
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
                    <span style={{ color: "#F4ECD8", fontWeight: 700 }}>Total</span>
                    <span
                      style={{
                        fontFamily: "'Playfair Display', serif",
                        fontSize: "1.25rem",
                        color: discountPct > 0 ? "#c5e87a" : "#F4ECD8",
                        fontWeight: 700,
                      }}
                    >
                      {Math.round(discounted).toLocaleString()} SP
                    </span>
                  </div>
                  {discountPct === 0 && qty < 3 && (
                    <p style={{ color: "rgba(244,236,216,0.5)", fontSize: "0.78rem", marginTop: "8px" }}>
                      Order 3+ pieces to unlock bulk discounts
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Discount tiers */}
          <div>
            <div className="flex items-center justify-between mb-5">
              <h3 style={{ color: "#F4ECD8", fontSize: "1.05rem", fontWeight: 700 }}>Discount Tiers</h3>
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
                  <Pencil size={12} /> Edit Tiers
                </button>
              )}
            </div>

            {!editingTiers ? (
              <div className="flex flex-col gap-3">
                {sortedTiers.map((t) => (
                  <div
                    key={t.minQty}
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
                      <p style={{ color: "#F4ECD8", fontWeight: 700 }}>{t.minQty}+ pieces</p>
                      <p style={{ color: "rgba(244,236,216,0.55)", fontSize: "0.8rem" }}>Minimum order quantity</p>
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
                      {t.discountPct}% off
                    </div>
                  </div>
                ))}
                {sortedTiers.length === 0 && (
                  <p style={{ color: "rgba(244,236,216,0.5)", fontSize: "0.9rem" }}>
                    No discount tiers configured yet.{isAdmin ? " Click Edit Tiers to add some." : ""}
                  </p>
                )}
              </div>
            ) : (
              /* Edit mode */
              <div className="flex flex-col gap-3">
                {draftTiers.map((t, idx) => (
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
                        value={t.minQty}
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
                      <span style={{ color: "rgba(244,236,216,0.6)", fontSize: "0.82rem" }}>pieces →</span>
                      <input
                        type="number"
                        value={t.discountPct}
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
                      <span style={{ color: "#c5e87a", fontSize: "0.82rem" }}>% off</span>
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
                  <Plus size={14} /> Add Tier
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
                    Cancel
                  </button>
                  <button
                    onClick={saveTiers}
                    style={{
                      flex: 2,
                      padding: "9px",
                      backgroundColor: "#c5e87a",
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
                    <Check size={14} /> Save Tiers
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
