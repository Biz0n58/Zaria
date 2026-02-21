import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LayoutDashboard, Package, ShoppingCart, LogOut } from "lucide-react";
import LogoutButton from "@/components/LogoutButton";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;

  if (!token) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 bg-gray-900 text-white">
        <div className="p-4 border-b border-gray-800">
          <h1 className="text-xl font-bold">Zaria Admin</h1>
        </div>

        <nav className="p-4 space-y-2">
          <Link
            href="/admin"
            className="flex items-center gap-3 px-4 py-2 rounded-md hover:bg-gray-800 transition-colors"
          >
            <LayoutDashboard size={20} />
            Dashboard
          </Link>

          <Link
            href="/admin/products"
            className="flex items-center gap-3 px-4 py-2 rounded-md hover:bg-gray-800 transition-colors"
          >
            <Package size={20} />
            Products
          </Link>

          <Link
            href="/admin/orders"
            className="flex items-center gap-3 px-4 py-2 rounded-md hover:bg-gray-800 transition-colors"
          >
            <ShoppingCart size={20} />
            Orders
          </Link>
        </nav>

        <div className="absolute bottom-0 w-64 p-4 border-t border-gray-800">
          <LogoutButton />
        </div>
      </aside>

      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
