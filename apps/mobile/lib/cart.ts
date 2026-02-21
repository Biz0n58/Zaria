import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Cart, CartItem } from "./types";

const CART_KEY = "zaria_cart";

export async function getCart(): Promise<Cart> {
  try {
    const stored = await AsyncStorage.getItem(CART_KEY);
    if (!stored) {
      return { items: [] };
    }
    return JSON.parse(stored);
  } catch {
    return { items: [] };
  }
}

export async function saveCart(cart: Cart): Promise<void> {
  await AsyncStorage.setItem(CART_KEY, JSON.stringify(cart));
}

export async function addToCart(productId: string, qty: number = 1): Promise<Cart> {
  const cart = await getCart();
  const existingIndex = cart.items.findIndex(
    (item) => item.product_id === productId
  );

  if (existingIndex >= 0) {
    cart.items[existingIndex].qty += qty;
  } else {
    cart.items.push({ product_id: productId, qty });
  }

  await saveCart(cart);
  return cart;
}

export async function updateCartItem(productId: string, qty: number): Promise<Cart> {
  const cart = await getCart();
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

  await saveCart(cart);
  return cart;
}

export async function removeFromCart(productId: string): Promise<Cart> {
  const cart = await getCart();
  cart.items = cart.items.filter((item) => item.product_id !== productId);
  await saveCart(cart);
  return cart;
}

export async function clearCart(): Promise<void> {
  await AsyncStorage.removeItem(CART_KEY);
}

export async function getCartItemCount(): Promise<number> {
  const cart = await getCart();
  return cart.items.reduce((total, item) => total + item.qty, 0);
}
