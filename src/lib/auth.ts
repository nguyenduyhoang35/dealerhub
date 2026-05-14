import { cookies } from "next/headers";
import { db } from "./db";

const COOKIE_NAME = "kho_session";

export type AuthUser = {
  id: number;
  name: string;
  phone: string;
  role: string;
  role_id: number | null;
  agent_id: number | null;
};

export async function login(phone: string, password: string): Promise<AuthUser | null> {
  const { data } = await db()
    .from("users")
    .select(`
      id, name, phone, role_id, agent_id,
      roles(name)
    `)
    .eq("phone", phone.trim())
    .eq("password", password)
    .eq("active", true)
    .maybeSingle();

  if (!data) return null;

  (await cookies()).set(COOKIE_NAME, String(data.id), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  return {
    id: data.id,
    name: data.name,
    phone: data.phone,
    role_id: data.role_id,
    agent_id: data.agent_id,
    role: (data.roles as any)?.name || "customer",
  };
}

export async function logout() {
  (await cookies()).delete(COOKIE_NAME);
}

export async function currentUser(): Promise<AuthUser | null> {
  const id = (await cookies()).get(COOKIE_NAME)?.value;
  if (!id) return null;

  const { data } = await db()
    .from("users")
    .select(`
      id, name, phone, role_id, agent_id,
      roles(name)
    `)
    .eq("id", Number(id))
    .eq("active", true)
    .maybeSingle();

  if (!data) return null;

  return {
    id: data.id,
    name: data.name,
    phone: data.phone,
    role_id: data.role_id,
    agent_id: data.agent_id,
    role: (data.roles as any)?.name || "customer",
  };
}
