import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";

const ALLOWED = ["pending", "delivering", "delivered", "cancelled"];

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  const body = await req.json();
  const user = await currentUser();

  if (user?.role === "driver") {
    const { data: o } = await db()
      .from("orders")
      .select("driver_id")
      .eq("id", id)
      .maybeSingle();
    if (!o || Number(o.driver_id) !== Number(user.id))
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
  if (body.driver_id !== undefined && user?.role === "admin")
    update.driver_id = body.driver_id ? Number(body.driver_id) : null;
  if (body.route_order !== undefined && user?.role === "admin")
    update.route_order = body.route_order === null ? null : Number(body.route_order);
  if (body.note !== undefined) update.note = body.note || null;

  if (Object.keys(update).length === 0) return NextResponse.json({ ok: true });

  const { error } = await db().from("orders").update(update).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const user = await currentUser();
  if (user?.role !== "admin")
    return NextResponse.json({ error: "Không có quyền" }, { status: 403 });
  const { error } = await db().from("orders").delete().eq("id", Number(params.id));
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
