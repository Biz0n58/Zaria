"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Product } from "@/lib/types";
import { Edit, Trash2 } from "lucide-react";

interface Props {
  products: Product[];
}

function formatCurrency(cents: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(cents / 100);
}

export default function ProductsTable({ products }: Props) {
  const router = useRouter();

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        router.refresh();
      }
    } catch {
      alert("Failed to delete product");
    }
  };

  if (products.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        No products found
      </div>
    );
  }

  return (
    <table className="w-full">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Name
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Price
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Stock
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Status
          </th>
          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
            Actions
          </th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {products.map((product) => (
          <tr key={product.id} className="hover:bg-gray-50">
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="font-medium text-gray-900">{product.name}</div>
              {product.description && (
                <div className="text-sm text-gray-500 truncate max-w-xs">
                  {product.description}
                </div>
              )}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-gray-900">
              {formatCurrency(product.price_cents, product.currency)}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-gray-900">
              {product.stock}
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <span
                className={`px-2 py-1 text-xs font-medium rounded-full ${
                  product.is_active
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {product.is_active ? "Active" : "Inactive"}
              </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-right">
              <div className="flex justify-end gap-2">
                <Link
                  href={`/admin/products/${product.id}/edit`}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                >
                  <Edit size={18} />
                </Link>
                <button
                  onClick={() => handleDelete(product.id, product.name)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
