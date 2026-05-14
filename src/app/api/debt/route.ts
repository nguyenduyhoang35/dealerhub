import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
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
      orders: [],
      pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
    });
  }

  const { searchParams } = new URL(req.url);
  const page = Number(searchParams.get("page")) || 1;
  const limit = Math.min(Number(searchParams.get("limit")) || 10, 50);

  // Get totals (all orders)
  const { data: allOrders, error: totalError } = await db()
    .from("orders")
    .select("total, paid")
    .eq("agent_id", user.agent_id);

  if (totalError) {
    return NextResponse.json({ error: totalError.message }, { status: 500 });
  }

  const total_orders = allOrders?.length || 0;
  const total_revenue = (allOrders || []).reduce((sum, o) => sum + (o.total || 0), 0);
  const total_paid = (allOrders || []).reduce((sum, o) => sum + (o.paid || 0), 0);
  const total_debt = total_revenue - total_paid;

  // Get paginated orders
  const { data: orders, error, count } = await db()
    .from("orders")
    .select("id, total, paid, status, created_at, delivery_date", { count: "exact" })
    .eq("agent_id", user.agent_id)
    .order("created_at", { ascending: false })
    .range((page - 1) * limit, page * limit - 1);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    total_orders,
    total_revenue,
    total_paid,
    total_debt,
    orders: orders || [],
    pagination: {
      page,
      limit,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limit),
    },
  });
}
