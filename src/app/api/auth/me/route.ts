import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const u = await currentUser();
  if (!u) return NextResponse.json({ user: null });

  // Get agent name if customer
  let agent_name = null;
  if (u.agent_id) {
    const { data: agent } = await db()
      .from("agents")
      .select("name")
      .eq("id", u.agent_id)
      .single();
    agent_name = agent?.name || null;
  }

  // Get role info
  let role_display = u.role;
  let is_system_role = false;
  if (u.role_id) {
    const { data: role } = await db()
      .from("roles")
      .select("display_name, is_system")
      .eq("id", u.role_id)
      .single();
    if (role) {
      role_display = role.display_name;
      is_system_role = role.is_system || false;
    }
  }

  // Get permissions
  let permissions: string[] = [];
  if (u.role === "superadmin") {
    // Superadmin has all permissions
    const { data: allPerms } = await db()
      .from("permissions")
      .select("code");
    permissions = allPerms?.map((p) => p.code) || [];
  } else if (u.role_id) {
    const { data: rolePerms } = await db()
      .from("role_permissions")
      .select(`
        permissions!inner(code)
      `)
      .eq("role_id", u.role_id);
    permissions = rolePerms?.map((rp: any) => rp.permissions.code) || [];
  }

  return NextResponse.json({
    user: {
      id: u.id,
      name: u.name,
      phone: u.phone,
      role: u.role,
      role_display,
      is_system_role,
      agent_id: u.agent_id,
      agent_name,
      permissions,
    },
  });
}
