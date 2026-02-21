import type { Cart, CartItem } from "./types";

const CART_KEY = "zaria_cart";

export function getCart(): Cart {
  if (typeof window === "undefined") {
    return { items: [] };
  }

  const stored = localStorage.getItem(CART_KEY);
  if (!stored) {
    return { items: [] };
  }

  try {
    return JSON.parse(stored);
  } catch {
    return { items: [] };
  }
}

export function saveCart(cart: Cart): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

export function addToCart(productId: string, qty: number = 1): Cart {
  const cart = getCart();
  const existingIndex = cart.items.findIndex(
    (item) => item.product_id === productId
  );

  if (existingIndex >= 0) {
    cart.items[existingIndex].qty += qty;
  } else {
    cart.items.push({ product_id: productId, qty });
  }

  saveCart(cart);
  return cart;
}

export function updateCartItem(productId: string, qty: number): Cart {
  const cart = getCart();
  const existingIndex = cart.items.findIndex(
    (item) => item.product_id === productId
  );

  if (existingIndex >= 0) {
    if (qty <= 0) {
      cart.items.splice(existingIndex, 1);
    } else {
      cart.items[existingIndex].qty = qty;
    }
  }

  saveCart(cart);
  return cart;
}

export function removeFromCart(productId: string): Cart {
  const cart = getCart();
  cart.items = cart.items.filter((item) => item.product_id !== productId);
  saveCart(cart);
  return cart;
}

export function clearCart(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(CART_KEY);
}

export function getCartItemCount(): number {
  const cart = getCart();
  return cart.items.reduce((total, item) => total + item.qty, 0);
}
