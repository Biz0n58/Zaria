import { CartItem } from './types';

const CART_KEY = 'zaria_cart';

export const cart = {
  get: (): CartItem[] => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(CART_KEY);
    if (!stored) return [];
    try {
      const parsed = JSON.parse(stored);
      return parsed.items || [];
    } catch {
      return [];
    }
  },

  set: (items: CartItem[]) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(CART_KEY, JSON.stringify({ items }));
  },

  add: (productId: string, qty: number = 1) => {
    const items = cart.get();
    const existing = items.find((item) => item.product_id === productId);
    if (existing) {
      existing.qty += qty;
    } else {
      items.push({ product_id: productId, qty });
    }
    cart.set(items);
  },

  update: (productId: string, qty: number) => {
    const items = cart.get();
    const index = items.findIndex((item) => item.product_id === productId);
    if (index !== -1) {
      if (qty <= 0) {
        items.splice(index, 1);
      } else {
        items[index].qty = qty;
      }
      cart.set(items);
    }
  },

  remove: (productId: string) => {
    const items = cart.get();
    cart.set(items.filter((item) => item.product_id !== productId));
  },

  clear: () => {
    cart.set([]);
  },
};
