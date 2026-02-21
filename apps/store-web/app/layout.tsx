import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import CartIcon from "@/components/CartIcon";

export const metadata: Metadata = {
  title: "Zaria Store",
  description: "Modern e-commerce store",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 min-h-screen">
        <header className="bg-white shadow-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link href="/" className="text-2xl font-bold text-gray-900">
                Zaria
              </Link>
              <nav className="flex items-center gap-6">
                <Link
                  href="/"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Products
                </Link>
                <CartIcon />
              </nav>
            </div>
          </div>
        </header>

        <main>{children}</main>

        <footer className="bg-white border-t mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <p className="text-center text-gray-500 text-sm">
              &copy; {new Date().getFullYear()} Zaria. All rights reserved.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
