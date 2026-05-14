import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function PUT(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const id = Number(params.id);
  const { name, unit, price, stock, category_id } = await req.json();
  if (!name?.trim()) return NextResponse.json({ error: "Thiếu tên" }, { status: 400 });
  const { error } = await db()
    .from("products")
    .update({
      name: name.trim(),
      unit: unit || "cái",
      price: Number(price) || 0,
      stock: Number(stock) || 0,
      category_id: category_id ? Number(category_id) : null,
    })
    .eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { error } = await db().from("products").delete().eq("id", Number(params.id));
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
