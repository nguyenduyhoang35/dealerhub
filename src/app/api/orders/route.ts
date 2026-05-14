import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const user = await currentUser();
  if (!user) {
    return NextResponse.json({ error: "Vui lòng đăng nhập" }, { status: 401 });
  }

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
       driver:users!orders_user_id_fkey(name, vehicle_plate),
       creator:users!orders_created_by_fkey(name),
       items:order_items(*, product:products(name, unit))`,
      { count: "exact" }
    );

  const isAdmin = user.role === "admin" || user.role === "superadmin";

  // Permission check: filter by role
  if (isAdmin) {
    // Admin sees all - apply filters from query params
    if (mine === "1") {
      q = q.eq("created_by", user.id);
    } else if (driverId) {
      q = q.eq("user_id", Number(driverId));
    } else if (unassigned === "1") {
      q = q.is("user_id", null);
    }
    if (agentId) q = q.eq("agent_id", Number(agentId));
  } else if (user.role === "driver") {
    // Driver only sees assigned orders
    q = q.eq("user_id", user.id);
  } else if (user.agent_id) {
    // Customer only sees their agent's orders
    q = q.eq("agent_id", user.agent_id);
  } else {
    // No agent_id, only see orders they created
    q = q.eq("created_by", user.id);
  }

  if (date) q = q.eq("delivery_date", date);
  if (status && status !== "all") {
    q = q.eq("status", status);
  }

  q = q
    .order("created_at", { ascending: false })
    .order("delivery_date", { ascending: false, nullsFirst: false })
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
    creator_name: o.creator?.name || null,
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

type Item = { product_id: number; quantity?: number; qty?: number; price?: number };

export async function POST(req: NextRequest) {
  const currentUserData = await currentUser();
  const { agent_id, delivery_date, note, items, paid, user_id } = await req.json();
  if (!agent_id) return NextResponse.json({ error: "Thiếu đại lý" }, { status: 400 });
  if (!Array.isArray(items) || items.length === 0)
    return NextResponse.json({ error: "Đơn rỗng" }, { status: 400 });

  const getQty = (it: Item) => Number(it.quantity || it.qty) || 0;

  // Validate quantities
  for (const it of items as Item[]) {
    const qty = getQty(it);
    if (qty <= 0 || qty > 10000000) {
      return NextResponse.json({ error: "Số lượng không hợp lệ" }, { status: 400 });
    }
  }

  // Fetch actual prices from database (don't trust client prices)
  const productIds = (items as Item[]).map((it) => Number(it.product_id));
  const { data: products, error: productsErr } = await db()
    .from("products")
    .select("id, price, name")
    .in("id", productIds);

  if (productsErr) {
    return NextResponse.json({ error: productsErr.message }, { status: 500 });
  }

  if (!products || products.length !== productIds.length) {
    return NextResponse.json({ error: "Một số sản phẩm không tồn tại" }, { status: 400 });
  }

  const priceMap = new Map(products.map((p) => [p.id, p.price]));

  // Calculate total using verified prices
  const total = (items as Item[]).reduce((s, it) => {
    const verifiedPrice = priceMap.get(Number(it.product_id)) || 0;
    return s + getQty(it) * verifiedPrice;
  }, 0);

  const { data: order, error: orderErr } = await db()
    .from("orders")
    .insert({
      agent_id: Number(agent_id),
      user_id: user_id ? Number(user_id) : null,
      created_by: currentUserData?.id || null,
      delivery_date: delivery_date || null,
      note: note || null,
      total,
      paid: Number(paid) || 0,
    })
    .select("id")
    .single();
  if (orderErr) return NextResponse.json({ error: orderErr.message }, { status: 500 });

  const itemRows = (items as Item[]).map((it) => {
    const verifiedPrice = priceMap.get(Number(it.product_id)) || 0;
    return {
      order_id: order.id,
      product_id: Number(it.product_id),
      quantity: getQty(it),
      price: verifiedPrice,
    };
  });
  const { error: itemsErr } = await db().from("order_items").insert(itemRows);
  if (itemsErr) {
    await db().from("orders").delete().eq("id", order.id);
    return NextResponse.json({ error: itemsErr.message }, { status: 500 });
  }

  return NextResponse.json({ id: order.id });
}
