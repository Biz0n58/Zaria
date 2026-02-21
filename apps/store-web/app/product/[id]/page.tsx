import { notFound } from "next/navigation";
import Image from "next/image";
import type { Product } from "@/lib/types";
import AddToCartButton from "@/components/AddToCartButton";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

interface Props {
  params: Promise<{ id: string }>;
}

async function getProduct(id: string): Promise<Product | null> {
  try {
    const res = await fetch(`${API_URL}/api/products/${id}`, {
      cache: "no-store",
    });

    if (!res.ok) {
      return null;
    }

    return res.json();
  } catch {
    return null;
  }
}

function formatCurrency(cents: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(cents / 100);
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    notFound();
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="aspect-square relative bg-gray-100 rounded-lg overflow-hidden">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xl">
              No Image
            </div>
          )}
        </div>

        <div>
          <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>

          <p className="text-3xl font-bold text-gray-900 mt-4">
            {formatCurrency(product.price_cents, product.currency)}
          </p>

          <div className="mt-4">
            {product.stock > 0 ? (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                In Stock ({product.stock} available)
              </span>
            ) : (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                Out of Stock
              </span>
            )}
          </div>

          {product.description && (
            <div className="mt-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                Description
              </h2>
              <p className="text-gray-600 leading-relaxed">
                {product.description}
              </p>
            </div>
          )}

          <div className="mt-8">
            <AddToCartButton
              productId={product.id}
              disabled={product.stock === 0}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
