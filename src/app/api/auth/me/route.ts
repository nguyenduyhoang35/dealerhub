import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";

export async function GET() {
  const u = await currentUser();
  if (!u) return NextResponse.json({ user: null });
  return NextResponse.json({
    user: { id: u.id, name: u.name, role: u.role, phone: u.phone },
  });
}
