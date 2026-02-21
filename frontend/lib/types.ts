export interface Product {
  id: string;
  name: string;
  description: string;
  price_cents: number;
  currency: string;
  image_url: string;
  stock: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  product_id: string;
  qty: number;
}

export interface Order {
  id: string;
  customer_email: string;
  status: string;
  subtotal_cents: number;
  shipping_cents: number;
  total_cents: number;
  currency: string;
  items?: OrderItem[];
  payment?: Payment;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  order_id: string;
  provider: string;
  provider_ref: string;
  status: string;
  amount_cents: number;
  currency: string;
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
