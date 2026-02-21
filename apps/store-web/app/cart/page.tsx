"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Trash2, Plus, Minus, ShoppingBag } from "lucide-react";
import { getCart, updateCartItem, removeFromCart } from "@/lib/cart";
import type { Cart, Product } from "@/lib/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

interface CartItemWithProduct {
  product: Product;
  qty: number;
}

function formatCurrency(cents: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(cents / 100);
}

export default function CartPage() {
  const [items, setItems] = useState<CartItemWithProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCartItems() {
      const cart = getCart();

      if (cart.items.length === 0) {
        setItems([]);
        setLoading(false);
        return;
      }

      const productPromises = cart.items.map(async (item) => {
        try {
          const res = await fetch(`${API_URL}/api/products/${item.product_id}`);
          if (!res.ok) return null;
          const product = await res.json();
          return { product, qty: item.qty };
        } catch {
          return null;
        }
      });

      const results = await Promise.all(productPromises);
      setItems(results.filter((item): item is CartItemWithProduct => item !== null));
      setLoading(false);
    }

    loadCartItems();
  }, []);

  const handleUpdateQty = (productId: string, newQty: number) => {
    if (newQty < 1) return;
    updateCartItem(productId, newQty);
    setItems(
      items.map((item) =>
        item.product.id === productId ? { ...item, qty: newQty } : item
      )
    );
    window.dispatchEvent(new Event("cartUpdated"));
  };

  const handleRemove = (productId: string) => {
    removeFromCart(productId);
    setItems(items.filter((item) => item.product.id !== productId));
    window.dispatchEvent(new Event("cartUpdated"));
  };

  const subtotal = items.reduce(
    (total, item) => total + item.product.price_cents * item.qty,
    0
  );

  const currency = items[0]?.product.currency || "usd";

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading cart...</p>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg mb-6">Your cart is empty</p>
          <Link
            href="/"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="divide-y">
          {items.map((item) => (
            <div key={item.product.id} className="p-6 flex gap-6">
              <div className="w-24 h-24 relative bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                {item.product.image_url ? (
                  <Image
                    src={item.product.image_url}
                    alt={item.product.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                    No Image
                  </div>
                )}
              </div>

              <div className="flex-1">
                <Link
                  href={`/product/${item.product.id}`}
                  className="font-semibold text-gray-900 hover:text-blue-600"
                >
                  {item.product.name}
                </Link>
                <p className="text-gray-600 mt-1">
                  {formatCurrency(item.product.price_cents, item.product.currency)}
                </p>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center border border-gray-300 rounded-md">
                  <button
                    onClick={() => handleUpdateQty(item.product.id, item.qty - 1)}
                    className="p-2 hover:bg-gray-100 transition-colors"
                    disabled={item.qty <= 1}
                  >
                    <Minus size={16} />
                  </button>
                  <span className="px-3 font-medium">{item.qty}</span>
                  <button
                    onClick={() => handleUpdateQty(item.product.id, item.qty + 1)}
                    className="p-2 hover:bg-gray-100 transition-colors"
                  >
                    <Plus size={16} />
                  </button>
                </div>

                <div className="w-24 text-right font-semibold text-gray-900">
                  {formatCurrency(
                    item.product.price_cents * item.qty,
                    item.product.currency
                  )}
                </div>

                <button
                  onClick={() => handleRemove(item.product.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="p-6 bg-gray-50 border-t">
          <div className="flex justify-between items-center text-lg">
            <span className="font-medium text-gray-900">Subtotal</span>
            <span className="font-bold text-gray-900">
              {formatCurrency(subtotal, currency)}
            </span>
          </div>

          <div className="mt-6 flex gap-4">
            <Link
              href="/"
              className="flex-1 text-center px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              Continue Shopping
            </Link>
            <Link
              href="/checkout"
              className="flex-1 text-center bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Proceed to Checkout
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
