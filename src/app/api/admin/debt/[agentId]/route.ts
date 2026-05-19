import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";

// GET: Chi tiết công nợ của một đại lý
export async function GET(
  req: NextRequest,
  props: { params: Promise<{ agentId: string }> }
) {
  const params = await props.params;
  const user = await currentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const agentId = Number(params.agentId);
  if (!agentId) {
    return NextResponse.json({ error: "Invalid agent ID" }, { status: 400 });
  }

  const { searchParams } = new URL(req.url);
  const page = Number(searchParams.get("page")) || 1;
  const limit = Math.min(Number(searchParams.get("limit")) || 20, 50);

  // Get agent info
  const { data: agent, error: agentErr } = await db()
    .from("agents")
    .select("id, name, phone, address")
    .eq("id", agentId)
    .single();

  if (agentErr || !agent) {
    return NextResponse.json({ error: "Đại lý không tồn tại" }, { status: 404 });
  }

  // Get totals
  const { data: allOrders, error: totalErr } = await db()
    .from("orders")
    .select("total, paid")
    .eq("agent_id", agentId);

  if (totalErr) {
    return NextResponse.json({ error: totalErr.message }, { status: 500 });
  }

  const total_orders = allOrders?.length || 0;
  const total_revenue = (allOrders || []).reduce((sum, o) => sum + (o.total || 0), 0);
  const total_paid = (allOrders || []).reduce((sum, o) => sum + (o.paid || 0), 0);
  const total_debt = total_revenue - total_paid;

  // Get paginated orders with debt
  const { data: orders, error: ordersErr, count } = await db()
    .from("orders")
    .select("id, total, paid, status, created_at, delivery_date, note", { count: "exact" })
    .eq("agent_id", agentId)
    .order("created_at", { ascending: false })
    .range((page - 1) * limit, page * limit - 1);

  if (ordersErr) {
    return NextResponse.json({ error: ordersErr.message }, { status: 500 });
  }

  // Get payment history
  const { data: payments, error: payErr } = await db()
    .from("payment_transactions")
    .select("id, amount, content, status, created_at, completed_at, order_id")
    .eq("agent_id", agentId)
    .eq("status", "completed")
    .order("completed_at", { ascending: false })
    .limit(20);

  return NextResponse.json({
    agent,
    totals: {
      total_orders,
      total_revenue,
      total_paid,
      total_debt,
    },
    orders: orders || [],
    payments: payments || [],
    pagination: {
      page,
      limit,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limit),
    },
  });
}

// POST: Ghi nhận thanh toán thủ công cho đại lý
export async function POST(
  req: NextRequest,
  props: { params: Promise<{ agentId: string }> }
) {
  const params = await props.params;
  const user = await currentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const agentId = Number(params.agentId);
  if (!agentId) {
    return NextResponse.json({ error: "Invalid agent ID" }, { status: 400 });
  }

  const body = await req.json();
  const { amount, note, order_id } = body;

  if (!amount || amount <= 0) {
    return NextResponse.json({ error: "Số tiền không hợp lệ" }, { status: 400 });
  }

  // Verify agent exists
  const { data: agent, error: agentErr } = await db()
    .from("agents")
    .select("id, name")
    .eq("id", agentId)
    .single();

  if (agentErr || !agent) {
    return NextResponse.json({ error: "Đại lý không tồn tại" }, { status: 404 });
  }

  // If order_id specified, update that specific order
  if (order_id) {
    const { data: order, error: orderErr } = await db()
      .from("orders")
      .select("id, total, paid, agent_id")
      .eq("id", order_id)
      .eq("agent_id", agentId)
      .single();

    if (orderErr || !order) {
      return NextResponse.json({ error: "Đơn hàng không tồn tại" }, { status: 404 });
    }

    const newPaid = Math.min(order.paid + amount, order.total);
    const paymentStatus = newPaid >= order.total ? "paid" : newPaid > 0 ? "partial" : "unpaid";

    const { error: updateErr } = await db()
      .from("orders")
      .update({ paid: newPaid, payment_status: paymentStatus })
      .eq("id", order_id);

    if (updateErr) {
      return NextResponse.json({ error: updateErr.message }, { status: 500 });
    }

    // Record payment
    await db().from("payment_transactions").insert({
      order_id,
      agent_id: agentId,
      amount: newPaid - order.paid,
      content: note || `Admin ghi nhận - đơn #${order_id}`,
      status: "completed",
      completed_at: new Date().toISOString(),
    });

    return NextResponse.json({ ok: true, updated_order: order_id, amount: newPaid - order.paid });
  }

  // No order_id: distribute payment across unpaid orders (oldest first)
  const { data: unpaidOrders, error: unpaidErr } = await db()
    .from("orders")
    .select("id, total, paid")
    .eq("agent_id", agentId)
    .lt("paid", db().rpc("col", { col: "total" })) // paid < total
    .order("created_at", { ascending: true });

  if (unpaidErr) {
    // Fallback: get orders and filter manually
    const { data: allOrders, error: allErr } = await db()
      .from("orders")
      .select("id, total, paid")
      .eq("agent_id", agentId)
      .order("created_at", { ascending: true });

    if (allErr) {
      return NextResponse.json({ error: allErr.message }, { status: 500 });
    }

    const ordersToUpdate = (allOrders || []).filter((o) => o.paid < o.total);
    let remaining = amount;
    const updates: { order_id: number; old_paid: number; new_paid: number }[] = [];

    for (const order of ordersToUpdate) {
      if (remaining <= 0) break;
      const debt = order.total - order.paid;
      const payment = Math.min(remaining, debt);
      const newPaid = order.paid + payment;

      const paymentStatus = newPaid >= order.total ? "paid" : "partial";

      await db()
        .from("orders")
        .update({ paid: newPaid, payment_status: paymentStatus })
        .eq("id", order.id);

      updates.push({ order_id: order.id, old_paid: order.paid, new_paid: newPaid });
      remaining -= payment;
    }

    // Record payment transaction
    await db().from("payment_transactions").insert({
      order_id: null,
      agent_id: agentId,
      amount: amount - remaining,
      content: note || "Admin ghi nhận thanh toán công nợ",
      status: "completed",
      completed_at: new Date().toISOString(),
    });

    return NextResponse.json({
      ok: true,
      total_applied: amount - remaining,
      remaining,
      updates,
    });
  }

  // Process with unpaidOrders
  let remaining = amount;
  const updates: { order_id: number; old_paid: number; new_paid: number }[] = [];

  for (const order of unpaidOrders || []) {
    if (remaining <= 0) break;
    const debt = order.total - order.paid;
    const payment = Math.min(remaining, debt);
    const newPaid = order.paid + payment;

    const paymentStatus = newPaid >= order.total ? "paid" : "partial";

    await db()
      .from("orders")
      .update({ paid: newPaid, payment_status: paymentStatus })
      .eq("id", order.id);

    updates.push({ order_id: order.id, old_paid: order.paid, new_paid: newPaid });
    remaining -= payment;
  }

  // Record payment transaction
  await db().from("payment_transactions").insert({
    order_id: null,
    agent_id: agentId,
    amount: amount - remaining,
    content: note || "Admin ghi nhận thanh toán công nợ",
    status: "completed",
    completed_at: new Date().toISOString(),
  });

  return NextResponse.json({
    ok: true,
    total_applied: amount - remaining,
    remaining,
    updates,
  });
}
