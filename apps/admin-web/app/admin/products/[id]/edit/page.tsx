import { cookies } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import { serverApiClient } from "@/lib/api";
import type { Product } from "@/lib/types";
import ProductForm from "@/components/ProductForm";
import { ArrowLeft } from "lucide-react";

interface Props {
  params: Promise<{ id: string }>;
}

async function getProduct(token: string, id: string): Promise<Product> {
  return serverApiClient<Product>(`/api/admin/products/${id}`, token);
}

export default async function EditProductPage({ params }: Props) {
  const { id } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value || "";

  let product: Product | null = null;

  try {
    product = await getProduct(token, id);
  } catch {
    notFound();
  }

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/admin/products"
          className="text-gray-600 hover:text-gray-900 flex items-center gap-2 mb-4"
        >
          <ArrowLeft size={20} />
          Back to Products
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <ProductForm product={product} mode="edit" />
      </div>
    </div>
  );
}
