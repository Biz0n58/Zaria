import Link from "next/link";

const products = [
  {
    id: 1,
    name: "Luxury Foundation",
    price: 25,
    description: "Smooth matte finish",
  },
  {
    id: 2,
    name: "Velvet Lipstick",
    price: 12,
    description: "Long lasting color",
  },
  {
    id: 3,
    name: "Glow Highlighter",
    price: 18,
    description: "Radiant shine",
  },
  {
    id: 4,
    name: "Blush Palette",
    price: 22,
    description: "Soft natural tones",
  },
];

export default function ProductsPage() {
  return (
    <main className="min-h-screen bg-white py-16">
      <div className="max-w-6xl mx-auto px-6">

        <h1 className="text-4xl font-bold mb-10 text-center">
          Our Products
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">

          {products.map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.id}`}
              className="border rounded-xl p-6 hover:shadow-lg transition"
            >
              <div className="h-48 bg-gray-100 rounded-lg mb-4"></div>

              <h3 className="text-lg font-semibold mb-2">
                {product.name}
              </h3>

              <p className="text-gray-500 mb-4">
                {product.description}
              </p>

              <p className="font-bold">
                {product.price} BHD
              </p>
            </Link>
          ))}

        </div>
      </div>
    </main>
  );
}
