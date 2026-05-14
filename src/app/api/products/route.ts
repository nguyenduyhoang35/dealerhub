import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = Number(searchParams.get("page")) || 1;
  const limit = Math.min(Number(searchParams.get("limit")) || 20, 100);
  const categoryId = searchParams.get("category_id");
  const search = searchParams.get("search");
  const all = searchParams.get("all"); // For admin to get all products without pagination

  let q = db()
    .from("products")
    .select("*, category:categories(id, name)", { count: "exact" })
    .eq("active", true);

  if (categoryId) {
    q = q.eq("category_id", Number(categoryId));
  }

  if (search) {
    q = q.ilike("name", `%${search}%`);
  }

  q = q.order("category_id").order("name");

  // If admin requests all products (for dropdowns, etc.)
  if (all === "1") {
    const { data, error } = await q;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  }

  // Paginated response
  q = q.range((page - 1) * limit, page * limit - 1);

  const { data, error, count } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    data: data || [],
    pagination: {
      page,
      limit,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limit),
      hasMore: page * limit < (count || 0),
    },
  });
}

export async function POST(req: NextRequest) {
  const { name, unit, price, stock, category_id } = await req.json();
  if (!name?.trim()) return NextResponse.json({ error: "Thiếu tên" }, { status: 400 });
  const { data, error } = await db()
    .from("products")
    .insert({
      name: name.trim(),
      unit: unit || "cái",
      price: Number(price) || 0,
      stock: Number(stock) || 0,
      category_id: category_id ? Number(category_id) : null,
    })
    .select("id")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ id: data.id });
}
