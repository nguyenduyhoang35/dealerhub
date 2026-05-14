import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { getUserWithPermissions, hasPermission, setRolePermissions } from "@/lib/rbac";

type Props = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, props: Props) {
  const params = await props.params;
  const user = await currentUser();
  if (!user) {
    return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
  }

  const userWithPerms = await getUserWithPermissions(user.id);
  if (!userWithPerms || !hasPermission(userWithPerms, "roles.view")) {
    return NextResponse.json({ error: "Không có quyền" }, { status: 403 });
  }

  const roleId = Number(params.id);

  // Get role with permissions
  const { data: role, error: roleError } = await db()
    .from("roles")
    .select("*")
    .eq("id", roleId)
    .single();

  if (roleError || !role) {
    return NextResponse.json({ error: "Không tìm thấy vai trò" }, { status: 404 });
  }

  const { data: rolePerms } = await db()
    .from("role_permissions")
    .select(`
      permissions!inner(code)
    `)
    .eq("role_id", roleId);

  const permissions = rolePerms?.map((rp: any) => rp.permissions.code) || [];

  return NextResponse.json({ ...role, permissions });
}

export async function PUT(req: NextRequest, props: Props) {
  const params = await props.params;
  const user = await currentUser();
  if (!user) {
    return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
  }

  const userWithPerms = await getUserWithPermissions(user.id);
  if (!userWithPerms || !hasPermission(userWithPerms, "roles.edit")) {
    return NextResponse.json({ error: "Không có quyền" }, { status: 403 });
  }

  const roleId = Number(params.id);
  const body = await req.json();
  const { name, display_name, description, permissions } = body;

  // Check if role exists and is not system role (for name change)
  const { data: existing } = await db()
    .from("roles")
    .select("*")
    .eq("id", roleId)
    .single();

  if (!existing) {
    return NextResponse.json({ error: "Không tìm thấy vai trò" }, { status: 404 });
  }

  // System roles cannot have their name changed
  const updateData: any = { display_name, description };
  if (!existing.is_system && name) {
    updateData.name = name;
  }

  const { error: updateError } = await db()
    .from("roles")
    .update(updateData)
    .eq("id", roleId);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  // Update permissions if provided
  if (Array.isArray(permissions) && hasPermission(userWithPerms, "roles.assign_permissions")) {
    await setRolePermissions(roleId, permissions);
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest, props: Props) {
  const params = await props.params;
  const user = await currentUser();
  if (!user) {
    return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
  }

  const userWithPerms = await getUserWithPermissions(user.id);
  if (!userWithPerms || !hasPermission(userWithPerms, "roles.delete")) {
    return NextResponse.json({ error: "Không có quyền" }, { status: 403 });
  }

  const roleId = Number(params.id);

  // Check if role is system role
  const { data: existing } = await db()
    .from("roles")
    .select("is_system")
    .eq("id", roleId)
    .single();

  if (!existing) {
    return NextResponse.json({ error: "Không tìm thấy vai trò" }, { status: 404 });
  }

  if (existing.is_system) {
    return NextResponse.json({ error: "Không thể xóa vai trò hệ thống" }, { status: 400 });
  }

  // Check if any users have this role
  const { count } = await db()
    .from("users")
    .select("*", { count: "exact", head: true })
    .eq("role_id", roleId);

  if (count && count > 0) {
    return NextResponse.json({ error: "Không thể xóa vai trò đang được sử dụng" }, { status: 400 });
  }

  const { error } = await db()
    .from("roles")
    .delete()
    .eq("id", roleId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
