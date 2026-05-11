import { createClient, SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!url || !serviceKey) {
  throw new Error(
    "Thiếu NEXT_PUBLIC_SUPABASE_URL hoặc SUPABASE_SERVICE_ROLE_KEY trong .env.local"
  );
}

let _client: SupabaseClient | null = null;

export function db(): SupabaseClient {
  if (!_client) {
    _client = createClient(url, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return _client;
}

export type Agent = {
  id: number;
  name: string;
  phone: string | null;
  address: string | null;
  note: string | null;
  created_at: string;
};

export type Product = {
  id: number;
  name: string;
  unit: string;
  price: number;
  stock: number;
  created_at: string;
};

export type Driver = {
  id: number;
  name: string;
  phone: string;
  pin: string;
  vehicle_plate: string | null;
  role: "admin" | "driver";
  active: boolean;
  created_at: string;
};

export type OrderStatus = "pending" | "delivering" | "delivered" | "cancelled";

export type Order = {
  id: number;
  agent_id: number;
  driver_id: number | null;
  route_order: number | null;
  status: OrderStatus;
  total: number;
  paid: number;
  collected_amount: number;
  delivery_date: string | null;
  delivered_at: string | null;
  note: string | null;
  created_at: string;
};

export type OrderItem = {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  price: number;
};
