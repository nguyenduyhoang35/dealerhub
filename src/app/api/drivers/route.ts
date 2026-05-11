import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const { data, error } = await db()
    .from("drivers")
    .select("id, name, phone, vehicle_plate, role, active, created_at")
    .order("role")
    .order("name");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const { name, phone, pin, vehicle_plate, role } = await req.json();
  if (!name?.trim() || !phone?.trim() || !pin?.trim())
    return NextResponse.json({ error: "Thiếu thông tin" }, { status: 400 });
  const { data, error } = await db()
    .from("drivers")
    .insert({
      name: name.trim(),
      phone: phone.trim(),
      pin: pin.trim(),
      vehicle_plate: vehicle_plate || null,
      role: role === "admin" ? "admin" : "driver",
    })
    .select("id")
    .single();
  if (error) {
    if (error.code === "23505")
      return NextResponse.json({ error: "Số điện thoại đã tồn tại" }, { status: 400 });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ id: data.id });
}
