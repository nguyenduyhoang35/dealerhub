import { db } from "./db";

export type Role = {
  id: number;
  name: string;
  display_name: string;
  description: string | null;
  is_system: boolean;
};

export type Permission = {
  id: number;
  code: string;
  name: string;
  module: string;
};

export type UserWithPermissions = {
  id: number;
  name: string;
  phone: string;
  role_id: number;
  role?: Role;
  permissions: string[];
};

export async function getUserPermissions(userId: number): Promise<string[]> {
  const { data, error } = await db()
    .from("role_permissions")
    .select(`
      permissions!inner(code)
    `)
    .eq("role_id", db().from("users").select("role_id").eq("id", userId).single());

  if (error || !data) return [];
  return data.map((rp: any) => rp.permissions.code);
}

export async function getUserWithPermissions(userId: number): Promise<UserWithPermissions | null> {
  const { data: user, error: userError } = await db()
    .from("users")
    .select(`
      id,
      name,
      phone,
      role_id,
      roles!inner(id, name, display_name, description, is_system)
    `)
    .eq("id", userId)
    .single();

  if (userError || !user) return null;

  const { data: perms } = await db()
    .from("role_permissions")
    .select(`
      permissions!inner(code)
    `)
    .eq("role_id", user.role_id);

  const permissions = perms?.map((rp: any) => rp.permissions.code) || [];

  return {
    id: user.id,
    name: user.name,
    phone: user.phone,
    role_id: user.role_id,
    role: (Array.isArray(user.roles) ? user.roles[0] : user.roles) as Role,
    permissions,
  };
}

export function hasPermission(user: UserWithPermissions, permission: string): boolean {
  if (user.role?.name === "superadmin") return true;
  return user.permissions.includes(permission);
}

export function hasAnyPermission(user: UserWithPermissions, permissions: string[]): boolean {
  if (user.role?.name === "superadmin") return true;
  return permissions.some((p) => user.permissions.includes(p));
}

export function hasAllPermissions(user: UserWithPermissions, permissions: string[]): boolean {
  if (user.role?.name === "superadmin") return true;
  return permissions.every((p) => user.permissions.includes(p));
}

export async function getRolePermissions(roleId: number): Promise<string[]> {
  const { data, error } = await db()
    .from("role_permissions")
    .select(`
      permissions!inner(code)
    `)
    .eq("role_id", roleId);

  if (error || !data) return [];
  return data.map((rp: any) => rp.permissions.code);
}

export async function getAllRoles(): Promise<Role[]> {
  const { data, error } = await db()
    .from("roles")
    .select("*")
    .order("id");

  if (error || !data) return [];
  return data;
}

export async function getAllPermissions(): Promise<Permission[]> {
  const { data, error } = await db()
    .from("permissions")
    .select("*")
    .order("module")
    .order("code");

  if (error || !data) return [];
  return data;
}

export async function getPermissionsByModule(): Promise<Record<string, Permission[]>> {
  const permissions = await getAllPermissions();
  const byModule: Record<string, Permission[]> = {};

  for (const p of permissions) {
    if (!byModule[p.module]) {
      byModule[p.module] = [];
    }
    byModule[p.module].push(p);
  }

  return byModule;
}

export async function setRolePermissions(roleId: number, permissionCodes: string[]): Promise<boolean> {
  const { data: perms } = await db()
    .from("permissions")
    .select("id, code")
    .in("code", permissionCodes);

  if (!perms) return false;

  // Delete existing
  await db()
    .from("role_permissions")
    .delete()
    .eq("role_id", roleId);

  // Insert new
  if (perms.length > 0) {
    const rows = perms.map((p) => ({ role_id: roleId, permission_id: p.id }));
    const { error } = await db()
      .from("role_permissions")
      .insert(rows);

    if (error) return false;
  }

  return true;
}

// Permission codes grouped by module for UI
export const PERMISSION_MODULES = {
  dashboard: "Dashboard",
  agents: "Đại lý",
  categories: "Danh mục",
  products: "Sản phẩm",
  orders: "Đơn hàng",
  routes: "Lên tuyến",
  users: "Người dùng",
  roles: "Vai trò",
  reports: "Báo cáo",
  settings: "Cài đặt",
} as const;
