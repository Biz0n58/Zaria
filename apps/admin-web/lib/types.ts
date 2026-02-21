export interface Admin {
  id: string;
  email: string;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  description: string | null;
  price_cents: number;
  currency: string;
  image_url: string | null;
  stock: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  name_snapshot: string;
  price_cents_snapshot: number;
  qty: number;
}

export interface Payment {
  id: string;
  order_id: string;
  provider: string;
  provider_ref: string | null;
  status: string;
  amount_cents: number;
  currency: string;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  user_id: string | null;
  customer_email: string;
  status: string;
  subtotal_cents: number;
  shipping_cents: number;
  total_cents: number;
  currency: string;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
  payments?: Payment[];
}

export interface ProductsListResponse {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface OrdersListResponse {
  orders: Order[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface Stats {
  total_orders: number;
  total_revenue: number;
  total_products: number;
  pending_orders: number;
}

export interface ApiError {
  error: string;
}
