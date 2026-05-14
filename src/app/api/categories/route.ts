import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const { data, error } = await db()
    .from("categories")
    .select("*")
    .order("sort_order")
    .order("name");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const { name, sort_order } = await req.json();
  if (!name?.trim()) return NextResponse.json({ error: "Thiếu tên danh mục" }, { status: 400 });
  const { data, error } = await db()
    .from("categories")
    .insert({
      name: name.trim(),
      sort_order: Number(sort_order) || 0,
    })
    .select("id")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ id: data.id });
}
