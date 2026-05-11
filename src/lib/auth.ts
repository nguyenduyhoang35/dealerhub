import { cookies } from "next/headers";
import { db, Driver } from "./db";

const COOKIE_NAME = "kho_session";

export async function login(phone: string, pin: string): Promise<Driver | null> {
  const { data } = await db()
    .from("drivers")
    .select("*")
    .eq("phone", phone.trim())
    .eq("pin", pin.trim())
    .eq("active", true)
    .maybeSingle();
  if (!data) return null;
  cookies().set(COOKIE_NAME, String(data.id), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return data as Driver;
}

export function logout() {
  cookies().delete(COOKIE_NAME);
}

export async function currentUser(): Promise<Driver | null> {
  const id = cookies().get(COOKIE_NAME)?.value;
  if (!id) return null;
  const { data } = await db()
    .from("drivers")
    .select("*")
    .eq("id", Number(id))
    .eq("active", true)
    .maybeSingle();
  return (data as Driver) || null;
}
