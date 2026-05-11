import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const { data, error } = await db().from("products").select("*").order("name");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const { name, unit, price, stock } = await req.json();
  if (!name?.trim()) return NextResponse.json({ error: "Thiếu tên" }, { status: 400 });
  const { data, error } = await db()
    .from("products")
    .insert({
      name: name.trim(),
      unit: unit || "cái",
      price: Number(price) || 0,
      stock: Number(stock) || 0,
    })
    .select("id")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ id: data.id });
}
