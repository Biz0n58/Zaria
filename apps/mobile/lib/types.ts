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

export interface CartItem {
  product_id: string;
  qty: number;
}

export interface Cart {
  items: CartItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  name_snapshot: string;
  price_cents_snapshot: number;
  qty: number;
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
}

export interface User {
  id: string;
  email: string;
  created_at: string;
}

export interface CheckoutResponse {
  order_id: string;
  total_cents: number;
  currency: string;
}

export interface PaymentIntentResponse {
  client_secret: string;
  payment_intent_id: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}
