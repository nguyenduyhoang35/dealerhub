import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";

export async function GET() {
  const user = await currentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!user.agent_id) {
    return NextResponse.json({
      total_orders: 0,
      total_revenue: 0,
      total_paid: 0,
      total_debt: 0,
      recent_orders: [],
    });
  }

  const { data: orders, error } = await db()
    .from("orders")
    .select("id, total, paid, status, created_at")
    .eq("agent_id", user.agent_id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const allOrders = orders || [];
  const total_orders = allOrders.length;
  const total_revenue = allOrders.reduce((sum, o) => sum + (o.total || 0), 0);
  const total_paid = allOrders.reduce((sum, o) => sum + (o.paid || 0), 0);
  const total_debt = total_revenue - total_paid;

  const recent_orders = allOrders.slice(0, 10).map((o) => ({
    id: o.id,
    total: o.total,
    paid: o.paid,
    status: o.status,
    created_at: o.created_at,
  }));

  return NextResponse.json({
    total_orders,
    total_revenue,
    total_paid,
    total_debt,
    recent_orders,
  });
}
