import { cookies } from "next/headers";
import { serverApiClient } from "@/lib/api";
import type { Stats } from "@/lib/types";
import { DollarSign, Package, ShoppingCart, Clock } from "lucide-react";

async function getStats(token: string): Promise<Stats> {
  return serverApiClient<Stats>("/api/admin/stats", token);
}

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

export default async function AdminDashboard() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value || "";

  let stats: Stats = {
    total_orders: 0,
    total_revenue: 0,
    total_products: 0,
    pending_orders: 0,
  };

  try {
    stats = await getStats(token);
  } catch {
    // Use default stats
  }

  const statCards = [
    {
      title: "Total Revenue",
      value: formatCurrency(stats.total_revenue),
      icon: DollarSign,
      color: "bg-green-500",
    },
    {
      title: "Total Orders",
      value: stats.total_orders.toString(),
      icon: ShoppingCart,
      color: "bg-blue-500",
    },
    {
      title: "Active Products",
      value: stats.total_products.toString(),
      icon: Package,
      color: "bg-purple-500",
    },
    {
      title: "Pending Orders",
      value: stats.pending_orders.toString(),
      icon: Clock,
      color: "bg-yellow-500",
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <div
            key={stat.title}
            className="bg-white rounded-lg shadow p-6 flex items-center gap-4"
          >
            <div className={`${stat.color} p-3 rounded-lg`}>
              <stat.icon className="text-white" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500">{stat.title}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
