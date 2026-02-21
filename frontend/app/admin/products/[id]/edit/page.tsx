'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { adminApi } from '@/lib/admin';
import { Product } from '@/lib/types';

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price_cents: '',
    currency: 'usd',
    image_url: '',
    stock: '',
    is_active: true,
  });

  useEffect(() => {
    if (params.id) {
      loadProduct();
    }
  }, [params.id]);

  const loadProduct = async () => {
    try {
      const data = await adminApi.products.getById(params.id as string);
      setProduct(data);
      setFormData({
        name: data.name,
        description: data.description,
        price_cents: (data.price_cents / 100).toFixed(2),
        currency: data.currency,
        image_url: data.image_url,
        stock: data.stock.toString(),
        is_active: data.is_active,
      });
    } catch (err: any) {
      if (err.message === 'Unauthorized' || err.message === 'Not authenticated') {
        router.push('/admin/login');
      } else {
        router.push('/admin/products');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
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

      await adminApi.products.update(params.id as string, {
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
      setError(err.message || 'Failed to update product');
    } finally {
      setSaving(false);
    }
  };

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
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Edit Product</h1>
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
                disabled={saving}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300"
              >
                {saving ? 'Saving...' : 'Save Changes'}
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
