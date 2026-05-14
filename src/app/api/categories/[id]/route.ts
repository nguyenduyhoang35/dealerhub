import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function PUT(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const id = Number(params.id);
  const { name, sort_order } = await req.json();
  if (!name?.trim()) return NextResponse.json({ error: "Thiếu tên danh mục" }, { status: 400 });

  const { error } = await db()
    .from("categories")
    .update({ name: name.trim(), sort_order: Number(sort_order) || 0 })
    .eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const id = Number(params.id);

  const { count } = await db()
    .from("products")
    .select("*", { count: "exact", head: true })
    .eq("category_id", id);

  if ((count || 0) > 0) {
    return NextResponse.json(
      { error: "Không thể xóa danh mục đang có sản phẩm" },
      { status: 400 }
    );
  }

  const { error } = await db().from("categories").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
