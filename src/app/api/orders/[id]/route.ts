import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";

export async function GET(_: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const id = Number(params.id);
  const user = await currentUser();

  if (!user) {
    return NextResponse.json({ error: "Vui lòng đăng nhập" }, { status: 401 });
  }

  const { data, error } = await db()
    .from("orders")
    .select(
      `*,
       agent:agents(name, phone, address),
       driver:users!orders_user_id_fkey(name, vehicle_plate),
       creator:users!orders_created_by_fkey(name),
       items:order_items(*, product:products(name, unit))`
    )
    .eq("id", id)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Không tìm thấy đơn hàng" }, { status: 404 });

  // Check permission: admin, creator, or same agent
  const isAdmin = user.role === "admin" || user.role === "superadmin";
  const isCreator = data.created_by === user.id;
  const isSameAgent = user.agent_id && data.agent_id === user.agent_id;
  const isDriver = user.role === "driver" && data.user_id === user.id;

  if (!isAdmin && !isCreator && !isSameAgent && !isDriver) {
    return NextResponse.json({ error: "Bạn không có quyền xem đơn hàng này" }, { status: 403 });
  }

  const order = {
    ...data,
    agent_name: data.agent?.name || null,
    agent_phone: data.agent?.phone || null,
    agent_address: data.agent?.address || null,
    driver_name: data.driver?.name || null,
    driver_plate: data.driver?.vehicle_plate || null,
    creator_name: data.creator?.name || null,
    items: (data.items || []).map((it: any) => ({
      ...it,
      product_name: it.product?.name || null,
      product_unit: it.product?.unit || null,
    })),
  };

  return NextResponse.json(order);
}

const ALLOWED = ["pending", "delivering", "delivered", "cancelled"];

export async function PATCH(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const id = Number(params.id);
  const body = await req.json();
  const user = await currentUser();

  if (user?.role === "driver") {
    const { data: o } = await db()
      .from("orders")
      .select("user_id")
      .eq("id", id)
      .maybeSingle();
    if (!o || Number(o.user_id) !== Number(user.id))
      return NextResponse.json({ error: "Không có quyền" }, { status: 403 });
  }

  const update: any = {};

  if (body.status !== undefined) {
    if (!ALLOWED.includes(body.status))
      return NextResponse.json({ error: "Trạng thái không hợp lệ" }, { status: 400 });
    update.status = body.status;
    if (body.status === "delivered") update.delivered_at = new Date().toISOString();
  }
  if (body.paid !== undefined) update.paid = Number(body.paid) || 0;
  if (body.collected_amount !== undefined)
    update.collected_amount = Number(body.collected_amount) || 0;
  if (body.delivery_date !== undefined) update.delivery_date = body.delivery_date || null;
  if (body.user_id !== undefined && user?.role === "admin")
    update.user_id = body.user_id ? Number(body.user_id) : null;
  if (body.route_order !== undefined && user?.role === "admin")
    update.route_order = body.route_order === null ? null : Number(body.route_order);
  if (body.note !== undefined) update.note = body.note || null;

  if (Object.keys(update).length === 0) return NextResponse.json({ ok: true });

  const { error } = await db().from("orders").update(update).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const user = await currentUser();
  if (user?.role !== "admin")
    return NextResponse.json({ error: "Không có quyền" }, { status: 403 });
  const { error } = await db().from("orders").delete().eq("id", Number(params.id));
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
