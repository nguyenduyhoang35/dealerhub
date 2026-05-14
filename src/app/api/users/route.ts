import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const { data, error } = await db()
    .from("users")
    .select(`
      id, name, phone, vehicle_plate, role, role_id, agent_id, active, created_at,
      roles(id, name, display_name),
      agents(id, name)
    `)
    .order("name");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const { name, phone, pin, vehicle_plate, role, role_id, agent_id } = await req.json();

  if (!name?.trim() || !phone?.trim() || !pin?.trim())
    return NextResponse.json({ error: "Thiếu thông tin" }, { status: 400 });

  const insertData: any = {
    name: name.trim(),
    phone: phone.trim(),
    pin: pin.trim(),
    vehicle_plate: vehicle_plate || null,
    agent_id: agent_id || null,
  };

  // Support both old role string and new role_id
  if (role_id) {
    insertData.role_id = role_id;
  } else if (role) {
    insertData.role = role;
  }

  const { data, error } = await db()
    .from("users")
    .insert(insertData)
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505")
      return NextResponse.json({ error: "Số điện thoại đã tồn tại" }, { status: 400 });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ id: data.id });
}
