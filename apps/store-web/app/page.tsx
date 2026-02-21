import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/lib/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

async function getProducts(): Promise<Product[]> {
  try {
    const res = await fetch(`${API_URL}/api/products`, {
      cache: "no-store",
    });

    if (!res.ok) {
      return [];
    }

    const data = await res.json();
    return data.products || [];
  } catch {
    return [];
  }
}

function formatCurrency(cents: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(cents / 100);
}

export default async function HomePage() {
  const products = await getProducts();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Our Products</h1>

      {products.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No products available yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/product/${product.id}`}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow group"
            >
              <div className="aspect-square relative bg-gray-100">
                {product.image_url ? (
                  <Image
                    src={product.image_url}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    No Image
                  </div>
                )}
              </div>
              <div className="p-4">
                <h2 className="font-semibold text-gray-900 truncate">
                  {product.name}
                </h2>
                <p className="text-gray-500 text-sm mt-1 line-clamp-2">
                  {product.description || "No description"}
                </p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-lg font-bold text-gray-900">
                    {formatCurrency(product.price_cents, product.currency)}
                  </span>
                  {product.stock > 0 ? (
                    <span className="text-sm text-green-600">In Stock</span>
                  ) : (
                    <span className="text-sm text-red-600">Out of Stock</span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
