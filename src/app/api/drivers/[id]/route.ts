import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function PUT(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const id = Number(params.id);
  const { name, phone, pin, vehicle_plate, role, active } = await req.json();
  if (!name?.trim() || !phone?.trim())
    return NextResponse.json({ error: "Thiếu thông tin" }, { status: 400 });

  const update: any = {
    name: name.trim(),
    phone: phone.trim(),
    vehicle_plate: vehicle_plate || null,
    role: role === "admin" ? "admin" : "driver",
    active: !!active,
  };
  if (pin?.trim()) update.pin = pin.trim();

  const { error } = await db().from("drivers").update(update).eq("id", id);
  if (error) {
    if (error.code === "23505")
      return NextResponse.json({ error: "Số điện thoại đã tồn tại" }, { status: 400 });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(_: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const id = Number(params.id);
  const { data: user } = await db().from("drivers").select("role").eq("id", id).maybeSingle();
  if (user?.role === "admin") {
    const { count } = await db()
      .from("drivers")
      .select("*", { count: "exact", head: true })
      .eq("role", "admin")
      .eq("active", true);
    if ((count || 0) <= 1)
      return NextResponse.json({ error: "Không thể xóa admin cuối cùng" }, { status: 400 });
  }
  const { error } = await db().from("drivers").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
