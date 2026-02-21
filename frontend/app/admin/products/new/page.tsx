'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { adminApi } from '@/lib/admin';

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price_cents: '',
    currency: 'usd',
    image_url: '',
    stock: '',
    is_active: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!formData.name.trim()) {
        throw new Error('Name is required');
      }
      const price = parseFloat(formData.price_cents);
      if (isNaN(price) || price <= 0) {
        throw new Error('Price must be positive');
      }
      const stock = parseInt(formData.stock);
      if (isNaN(stock) || stock < 0) {
        throw new Error('Stock must be non-negative');
      }

      await adminApi.products.create({
        name: formData.name,
        description: formData.description,
        price_cents: Math.round(price * 100),
        currency: formData.currency,
        image_url: formData.image_url,
        stock: stock,
        is_active: formData.is_active,
      });

      router.push('/admin/products');
    } catch (err: any) {
      setError(err.message || 'Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link href="/admin" className="text-2xl font-bold text-gray-900">
                Zaria Admin
              </Link>
              <Link href="/admin/products" className="text-gray-700 hover:text-gray-900">
                Products
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link href="/admin/products" className="text-blue-600 hover:text-blue-800">
            ← Back to Products
          </Link>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-8">New Product</h1>
        <div className="bg-white rounded-lg shadow-md p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">Price (USD) *</label>
                <input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={formData.price_cents}
                  onChange={(e) => setFormData({ ...formData, price_cents: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-2">Stock *</label>
                <input
                  id="stock"
                  type="number"
                  min="0"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
            <div>
              <label htmlFor="image_url" className="block text-sm font-medium text-gray-700 mb-2">Image URL</label>
              <input
                id="image_url"
                type="url"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Active</span>
              </label>
            </div>
            {error && <p className="text-red-600">{error}</p>}
            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300"
              >
                {loading ? 'Creating...' : 'Create Product'}
              </button>
              <Link
                href="/admin/products"
                className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
