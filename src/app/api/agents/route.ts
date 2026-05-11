import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const { data, error } = await db().from("agents").select("*").order("name");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const { name, phone, address, note } = await req.json();
  if (!name?.trim()) return NextResponse.json({ error: "Thiếu tên" }, { status: 400 });
  const { data, error } = await db()
    .from("agents")
    .insert({ name: name.trim(), phone: phone || null, address: address || null, note: note || null })
    .select("id")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ id: data.id });
}
