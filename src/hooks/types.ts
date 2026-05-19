export type Category = {
  id: number;
  name: string;
  sort_order?: number;
};

export type Product = {
  id: number;
  name: string;
  unit: string;
  price: number;
  stock?: number;
  category_id: number | null;
  category: Category | null;
};

export type OrderStatus = "pending" | "delivering" | "delivered" | "cancelled";
export type PaymentStatus = "unpaid" | "partial" | "paid";

export type Order = {
  id: number;
  agent_id: number;
  agent_name: string;
  agent_phone?: string | null;
  agent_address?: string | null;
  user_id?: number | null;
  driver_name?: string | null;
  driver_plate?: string | null;
  created_by?: number | null;
  creator_name?: string | null;
  total: number;
  paid: number;
  status: OrderStatus;
  payment_status: PaymentStatus;
  note?: string | null;
  delivery_date: string | null;
  created_at: string;
  items?: OrderItem[];
};

export type OrderItem = {
  id: number;
  product_id: number;
  product_name: string;
  product_unit?: string | null;
  quantity: number;
  price: number;
};

export type DebtInfo = {
  total_orders: number;
  total_revenue: number;
  total_paid: number;
  total_debt: number;
  agent_id: number | null;
  orders: {
    id: number;
    agent_id: number;
    total: number;
    paid: number;
    status: string;
    created_at: string;
    delivery_date: string | null;
  }[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type PaymentInfo = {
  qr_url: string;
  bank_name: string;
  account_number: string;
  account_name: string;
  amount: number;
  content: string;
  order_id?: number;
  expires_at: string;
};

export type PaymentTransaction = {
  id: number;
  order_id: number | null;
  agent_id: number | null;
  amount: number;
  content: string;
  status: "pending" | "completed" | "expired";
  bank_ref: string | null;
  created_at: string;
  completed_at: string | null;
};

export type PaginatedResponse<T> = {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore?: boolean;
  };
};

export type DashboardStats = {
  orders: {
    total: number;
    pending: number;
    delivering: number;
    delivered: number;
  };
  revenue: {
    total: number;
    paid: number;
    debt: number;
  };
};

export type AdminStats = {
  totals: {
    orders: number;
    revenue: number;
    paid: number;
    debt: number;
    pending: number;
    delivering: number;
    delivered: number;
    cancelled: number;
  };
  byAgent: {
    id: number;
    name: string;
    order_count: number;
    revenue: number;
    paid: number;
    debt: number;
  }[];
  todayByDriver: {
    id: number;
    name: string;
    vehicle_plate: string | null;
    orders: number;
    delivered: number;
    remaining: number;
    total_value: number;
    collected: number;
  }[];
  today: string;
  byMonth: { month: string; orders: number; revenue: number }[];
};

export type Agent = {
  id: number;
  name: string;
  phone: string | null;
  address: string | null;
  note: string | null;
};

export type User = {
  id: number;
  name: string;
  phone: string;
  role_id: number;
  role?: { id: number; name: string };
  agent_id: number | null;
  agent?: Agent | null;
  vehicle_plate: string | null;
  active: boolean;
};

export type Role = {
  id: number;
  name: string;
  display_name: string;
  description: string | null;
  is_system?: boolean;
};

export type Permission = {
  id: number;
  code: string;
  name: string;
  description: string | null;
};

export type AgentDebtSummary = {
  id: number;
  name: string;
  phone: string | null;
  address: string | null;
  order_count: number;
  revenue: number;
  paid: number;
  debt: number;
};

export type AdminDebtResponse = {
  data: AgentDebtSummary[];
  totals: {
    total_agents: number;
    total_revenue: number;
    total_paid: number;
    total_debt: number;
    agents_with_debt: number;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type AgentDebtDetail = {
  agent: {
    id: number;
    name: string;
    phone: string | null;
    address: string | null;
  };
  totals: {
    total_orders: number;
    total_revenue: number;
    total_paid: number;
    total_debt: number;
  };
  orders: {
    id: number;
    total: number;
    paid: number;
    status: string;
    created_at: string;
    delivery_date: string | null;
    note: string | null;
  }[];
  payments: {
    id: number;
    amount: number;
    content: string;
    status: string;
    created_at: string;
    completed_at: string | null;
    order_id: number | null;
  }[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};
