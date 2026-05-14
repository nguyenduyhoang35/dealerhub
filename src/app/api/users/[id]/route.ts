import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function PUT(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const id = Number(params.id);
  const { name, phone, pin, vehicle_plate, role, role_id, agent_id, active } = await req.json();

  if (!name?.trim() || !phone?.trim())
    return NextResponse.json({ error: "Thiếu thông tin" }, { status: 400 });

  const update: any = {
    name: name.trim(),
    phone: phone.trim(),
    vehicle_plate: vehicle_plate || null,
    agent_id: agent_id || null,
    active: !!active,
  };

  // Support both old role string and new role_id
  if (role_id) {
    update.role_id = role_id;
  } else if (role) {
    update.role = role;
  }

  if (pin?.trim()) update.pin = pin.trim();

  const { error } = await db().from("users").update(update).eq("id", id);
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

  // Check if user is superadmin - cannot delete last superadmin
  const { data: user } = await db()
    .from("users")
    .select(`
      role,
      roles(name)
    `)
    .eq("id", id)
    .maybeSingle();

  const roleName = user?.roles?.name || user?.role;

  if (roleName === "superadmin") {
    const { count } = await db()
      .from("users")
      .select(`*, roles!inner(name)`, { count: "exact", head: true })
      .eq("roles.name", "superadmin")
      .eq("active", true);

    if ((count || 0) <= 1)
      return NextResponse.json({ error: "Không thể xóa superadmin cuối cùng" }, { status: 400 });
  }

  const { error } = await db().from("users").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
