import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { getUserWithPermissions, hasPermission } from "@/lib/rbac";

export async function GET() {
  const user = await currentUser();
  if (!user) {
    return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
  }

  const userWithPerms = await getUserWithPermissions(user.id);
  if (!userWithPerms || !hasPermission(userWithPerms, "roles.view")) {
    return NextResponse.json({ error: "Không có quyền" }, { status: 403 });
  }

  const { data, error } = await db()
    .from("roles")
    .select("*")
    .order("id");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const user = await currentUser();
  if (!user) {
    return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
  }

  const userWithPerms = await getUserWithPermissions(user.id);
  if (!userWithPerms || !hasPermission(userWithPerms, "roles.create")) {
    return NextResponse.json({ error: "Không có quyền" }, { status: 403 });
  }

  const body = await req.json();
  const { name, display_name, description } = body;

  if (!name || !display_name) {
    return NextResponse.json({ error: "Thiếu thông tin bắt buộc" }, { status: 400 });
  }

  const { data, error } = await db()
    .from("roles")
    .insert({ name, display_name, description, is_system: false })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ error: "Tên vai trò đã tồn tại" }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
