'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Product } from '@/lib/types';
import { cart } from '@/lib/cart';

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    if (params.id) {
      api.products
        .getById(params.id as string)
        .then((data) => {
          if (!data.is_active) {
            setError('Product is not available');
          } else {
            setProduct(data);
            setError(null);
          }
        })
        .catch(() => {
          setError('Product not found');
        })
        .finally(() => setLoading(false));
    }
  }, [params.id]);

  const handleAddToCart = () => {
    if (product) {
      cart.add(product.id, qty);
      alert('Added to cart!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Product not found'}</p>
          <Link href="/" className="text-blue-600 hover:text-blue-800">
            Back to Products
          </Link>
        </div>
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
              <Link href="/cart" className="text-gray-700 hover:text-gray-900">
                Cart ({cart.get().length})
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
          ← Back to products
        </Link>
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="md:flex">
            {product.image_url && (
              <div className="md:w-1/2">
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-96 object-cover"
                />
              </div>
            )}
            <div className="md:w-1/2 p-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>
              <p className="text-gray-600 mb-6">{product.description}</p>
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900">
                  ${(product.price_cents / 100).toFixed(2)}
                </span>
              </div>
              <div className="mb-6">
                <p className="text-sm text-gray-500 mb-2">Stock: {product.stock}</p>
                {product.stock > 0 && product.is_active && (
                  <div className="flex items-center space-x-4">
                    <label htmlFor="qty" className="text-sm font-medium text-gray-700">Quantity:</label>
                    <input
                      id="qty"
                      type="number"
                      min="1"
                      max={product.stock}
                      value={qty}
                      onChange={(e) => setQty(parseInt(e.target.value) || 1)}
                      className="w-20 px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                )}
              </div>
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0 || !product.is_active}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-semibold"
              >
                {product.stock === 0 ? 'Out of Stock' : !product.is_active ? 'Unavailable' : 'Add to Cart'}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
