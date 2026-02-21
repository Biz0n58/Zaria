'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Product, CartItem } from '@/lib/types';
import { cart } from '@/lib/cart';

export default function CartPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [products, setProducts] = useState<Record<string, Product>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const items = cart.get();
    setCartItems(items);

    Promise.all(items.map((item) => api.products.getById(item.product_id)))
      .then((prods) => {
        const prodMap: Record<string, Product> = {};
        prods.forEach((prod) => {
          prodMap[prod.id] = prod;
        });
        setProducts(prodMap);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const updateQty = (productId: string, qty: number) => {
    cart.update(productId, qty);
    setCartItems(cart.get());
  };

  const removeItem = (productId: string) => {
    cart.remove(productId);
    setCartItems(cart.get());
  };

  const totalCents = cartItems.reduce((sum, item) => {
    const product = products[item.product_id];
    if (!product) return sum;
    return sum + product.price_cents * item.qty;
  }, 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold text-gray-900">
                Zaria
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-gray-700 hover:text-gray-900">
                Products
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>
        {cartItems.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-500 mb-4">Your cart is empty</p>
            <Link href="/" className="text-blue-600 hover:text-blue-800">
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md p-6">
                {cartItems.map((item) => {
                  const product = products[item.product_id];
                  if (!product) return null;
                  return (
                    <div key={item.product_id} className="flex items-center space-x-4 py-4 border-b last:border-b-0">
                      {product.image_url && (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-20 h-20 object-cover rounded"
                        />
                      )}
                      <div className="flex-1">
                        <Link href={`/product/${product.id}`}>
                          <h3 className="font-semibold text-gray-900 hover:text-blue-600">
                            {product.name}
                          </h3>
                        </Link>
                        <p className="text-gray-600 text-sm">
                          ${(product.price_cents / 100).toFixed(2)} each
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateQty(item.product_id, item.qty - 1)}
                          className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50"
                        >
                          -
                        </button>
                        <span className="w-12 text-center">{item.qty}</span>
                        <button
                          onClick={() => updateQty(item.product_id, item.qty + 1)}
                          disabled={item.qty >= product.stock}
                          className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          +
                        </button>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          ${((product.price_cents * item.qty) / 100).toFixed(2)}
                        </p>
                        <button
                          onClick={() => removeItem(item.product_id)}
                          className="text-red-600 hover:text-red-800 text-sm mt-1"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>${(totalCents / 100).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span>{totalCents >= 5000 ? 'Free' : '$5.00'}</span>
                  </div>
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between text-lg font-bold text-gray-900">
                      <span>Total</span>
                      <span>${((totalCents + (totalCents < 5000 ? 500 : 0)) / 100).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => router.push('/checkout')}
                  className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
                >
                  Proceed to Checkout
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
