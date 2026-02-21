import Link from "next/link";
import ProductForm from "@/components/ProductForm";
import { ArrowLeft } from "lucide-react";

export default function NewProductPage() {
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
        <h1 className="text-2xl font-bold text-gray-900">New Product</h1>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <ProductForm mode="create" />
      </div>
    </div>
  );
}
