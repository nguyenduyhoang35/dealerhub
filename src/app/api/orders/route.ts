import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const user = await currentUser();
  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");
  const driverId = searchParams.get("user_id");
  const agentId = searchParams.get("agent_id");
  const mine = searchParams.get("mine");
  const unassigned = searchParams.get("unassigned");
  const status = searchParams.get("status");
  const debt = searchParams.get("debt");
  const page = Number(searchParams.get("page")) || 1;
  const limit = Math.min(Number(searchParams.get("limit")) || 20, 100);

  let q = db()
    .from("orders")
    .select(
      `*,
       agent:agents(name, phone, address),
       driver:users(name, vehicle_plate),
       items:order_items(*, product:products(name, unit))`,
      { count: "exact" }
    );

  if (mine === "1" && user?.role === "driver") {
    q = q.eq("user_id", user.id);
  } else if (driverId) {
    q = q.eq("user_id", Number(driverId));
  } else if (unassigned === "1") {
    q = q.is("user_id", null);
  }

  if (date) q = q.eq("delivery_date", date);
  if (agentId) q = q.eq("agent_id", Number(agentId));
  if (status && status !== "all") {
    q = q.eq("status", status);
  }

  q = q
    .order("delivery_date", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .range((page - 1) * limit, page * limit - 1);

  const { data, error, count } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  let result = (data || []).map((o: any) => ({
    ...o,
    agent_name: o.agent?.name || null,
    agent_phone: o.agent?.phone || null,
    agent_address: o.agent?.address || null,
    driver_name: o.driver?.name || null,
    driver_plate: o.driver?.vehicle_plate || null,
    items: (o.items || []).map((it: any) => ({
      ...it,
      product_name: it.product?.name || null,
      product_unit: it.product?.unit || null,
    })),
  }));

  // Filter by debt status
  if (debt === "has_debt") {
    result = result.filter((o: any) => o.total > o.paid);
  } else if (debt === "no_debt") {
    result = result.filter((o: any) => o.total <= o.paid);
  }

  const hasDebtFilter = debt === "has_debt" || debt === "no_debt";

  return NextResponse.json({
    data: result,
    pagination: {
      page,
      limit,
      total: hasDebtFilter ? result.length : (count || 0),
      totalPages: hasDebtFilter ? 1 : Math.ceil((count || 0) / limit),
    },
  });
}

type Item = { product_id: number; quantity: number; price: number };

export async function POST(req: NextRequest) {
  const { agent_id, delivery_date, note, items, paid, user_id } = await req.json();
  if (!agent_id) return NextResponse.json({ error: "Thiếu đại lý" }, { status: 400 });
  if (!Array.isArray(items) || items.length === 0)
    return NextResponse.json({ error: "Đơn rỗng" }, { status: 400 });

  const total = (items as Item[]).reduce(
    (s, it) => s + Number(it.quantity) * Number(it.price),
    0
  );

  const { data: order, error: orderErr } = await db()
    .from("orders")
    .insert({
      agent_id: Number(agent_id),
      user_id: user_id ? Number(user_id) : null,
      delivery_date: delivery_date || null,
      note: note || null,
      total,
      paid: Number(paid) || 0,
    })
    .select("id")
    .single();
  if (orderErr) return NextResponse.json({ error: orderErr.message }, { status: 500 });

  const itemRows = (items as Item[]).map((it) => ({
    order_id: order.id,
    product_id: Number(it.product_id),
    quantity: Number(it.quantity),
    price: Number(it.price),
  }));
  const { error: itemsErr } = await db().from("order_items").insert(itemRows);
  if (itemsErr) {
    await db().from("orders").delete().eq("id", order.id);
    return NextResponse.json({ error: itemsErr.message }, { status: 500 });
  }

  return NextResponse.json({ id: order.id });
}
