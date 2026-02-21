import { cookies } from "next/headers";
import Link from "next/link";
import { serverApiClient } from "@/lib/api";
import type { OrdersListResponse } from "@/lib/types";
import Pagination from "@/components/Pagination";
import OrderStatusFilter from "@/components/OrderStatusFilter";

interface Props {
  searchParams: Promise<{ status?: string; page?: string }>;
}

async function getOrders(
  token: string,
  status: string,
  page: number
): Promise<OrdersListResponse> {
  const params = new URLSearchParams();
  if (status) params.set("status", status);
  params.set("page", page.toString());
  params.set("limit", "10");

  return serverApiClient<OrdersListResponse>(
    `/api/admin/orders?${params.toString()}`,
    token
  );
}

function formatCurrency(cents: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(cents / 100);
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    paid: "bg-green-100 text-green-800",
    processing: "bg-blue-100 text-blue-800",
    shipped: "bg-purple-100 text-purple-800",
    delivered: "bg-green-100 text-green-800",
    cancelled: "bg-gray-100 text-gray-800",
    failed: "bg-red-100 text-red-800",
  };
  return colors[status] || "bg-gray-100 text-gray-800";
}

export default async function OrdersPage({ searchParams }: Props) {
  const params = await searchParams;
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value || "";

  const status = params.status || "";
  const page = parseInt(params.page || "1");

  let data: OrdersListResponse = {
    orders: [],
    total: 0,
    page: 1,
    limit: 10,
    total_pages: 0,
  };

  try {
    data = await getOrders(token, status, page);
  } catch {
    // Use empty data
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Orders</h1>

      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <OrderStatusFilter currentStatus={status} />
        </div>

        {data.orders.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No orders found</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      {order.id.slice(0, 8)}...
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                    {order.customer_email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                    {formatCurrency(order.total_cents, order.currency)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500 text-sm">
                    {formatDate(order.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {data.total_pages > 1 && (
          <div className="p-4 border-t">
            <Pagination
              currentPage={data.page}
              totalPages={data.total_pages}
              basePath="/admin/orders"
              searchParams={{ status }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
