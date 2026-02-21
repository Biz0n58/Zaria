"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingCart, Plus, Minus } from "lucide-react";
import { addToCart } from "@/lib/cart";

interface Props {
  productId: string;
  disabled?: boolean;
}

export default function AddToCartButton({ productId, disabled }: Props) {
  const router = useRouter();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const handleAddToCart = () => {
    addToCart(productId, qty);
    window.dispatchEvent(new Event("cartUpdated"));
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const goToCart = () => {
    router.push("/cart");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <span className="text-gray-700 font-medium">Quantity:</span>
        <div className="flex items-center border border-gray-300 rounded-md">
          <button
            onClick={() => setQty(Math.max(1, qty - 1))}
            className="p-2 hover:bg-gray-100 transition-colors"
            disabled={disabled}
          >
            <Minus size={20} />
          </button>
          <span className="px-4 py-2 font-medium">{qty}</span>
          <button
            onClick={() => setQty(qty + 1)}
            className="p-2 hover:bg-gray-100 transition-colors"
            disabled={disabled}
          >
            <Plus size={20} />
          </button>
        </div>
      </div>

      <div className="flex gap-4">
        <button
          onClick={handleAddToCart}
          disabled={disabled}
          className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold transition-colors ${
            added
              ? "bg-green-600 text-white"
              : disabled
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          <ShoppingCart size={20} />
          {added ? "Added!" : "Add to Cart"}
        </button>

        {added && (
          <button
            onClick={goToCart}
            className="px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
          >
            View Cart
          </button>
        )}
      </div>
    </div>
  );
}
