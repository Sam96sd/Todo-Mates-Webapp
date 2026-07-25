export interface CartItem {
  productId: string;
  qty: number;
}

export function addCartItem(items: CartItem[], productId: string, qty: number): CartItem[] {
  const existing = items.find((item) => item.productId === productId);
  if (existing) {
    return items.map((item) =>
      item.productId === productId ? { ...item, qty: item.qty + qty } : item
    );
  }
  return [...items, { productId, qty }];
}

export function updateCartItemQty(items: CartItem[], productId: string, qty: number): CartItem[] {
  if (qty < 1) {
    return items.filter((item) => item.productId !== productId);
  }
  return items.map((item) => (item.productId === productId ? { ...item, qty } : item));
}

export function removeCartItem(items: CartItem[], productId: string): CartItem[] {
  return items.filter((item) => item.productId !== productId);
}
