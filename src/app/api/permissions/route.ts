import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { getUserWithPermissions, hasPermission, PERMISSION_MODULES } from "@/lib/rbac";

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
    .from("permissions")
    .select("*")
    .order("module")
    .order("code");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Group by module
  const byModule: Record<string, { module: string; moduleName: string; permissions: typeof data }> = {};

  for (const p of data || []) {
    if (!byModule[p.module]) {
      byModule[p.module] = {
        module: p.module,
        moduleName: PERMISSION_MODULES[p.module as keyof typeof PERMISSION_MODULES] || p.module,
        permissions: [],
      };
    }
    byModule[p.module].permissions.push(p);
  }

  return NextResponse.json(Object.values(byModule));
}
