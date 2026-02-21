'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { adminApi } from '@/lib/admin';

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [products, orders] = await Promise.all([
          adminApi.products.getAll({ limit: 1 }),
          adminApi.orders.getAll({ limit: 1 }),
        ]);

        const activeProducts = await adminApi.products.getAll({ is_active: true, limit: 1 });
        const pendingOrders = await adminApi.orders.getAll({ status: 'pending', limit: 1 });

        setStats({
          totalProducts: products.total || 0,
          activeProducts: activeProducts.total || 0,
          totalOrders: orders.total || 0,
          pendingOrders: pendingOrders.total || 0,
        });
      } catch (error) {
        console.error(error);
        router.push('/admin/login');
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, [router]);

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
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
              <span className="text-2xl font-bold text-gray-900">Zaria Admin</span>
              <Link href="/admin/products" className="text-gray-700 hover:text-gray-900">
                Products
              </Link>
              <Link href="/admin/orders" className="text-gray-700 hover:text-gray-900">
                Orders
              </Link>
            </div>
            <div className="flex items-center">
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-gray-700 hover:text-gray-900"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Total Products</h3>
            <p className="text-3xl font-bold text-gray-900">{stats.totalProducts}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Active Products</h3>
            <p className="text-3xl font-bold text-green-600">{stats.activeProducts}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Total Orders</h3>
            <p className="text-3xl font-bold text-gray-900">{stats.totalOrders}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Pending Orders</h3>
            <p className="text-3xl font-bold text-yellow-600">{stats.pendingOrders}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link
            href="/admin/products"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Manage Products</h2>
            <p className="text-gray-600">View, create, edit, and delete products</p>
          </Link>
          <Link
            href="/admin/orders"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Manage Orders</h2>
            <p className="text-gray-600">View and update order status</p>
          </Link>
        </div>
      </main>
    </div>
  );
}
