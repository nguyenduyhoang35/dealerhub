import { NextRequest, NextResponse } from "next/server";
import { login } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { phone, pin } = await req.json();
  if (!phone || !pin)
    return NextResponse.json({ error: "Thiếu thông tin" }, { status: 400 });

  const user = await login(phone, pin);
  if (!user)
    return NextResponse.json({ error: "Sai số điện thoại hoặc mã PIN" }, { status: 401 });

  return NextResponse.json({
    id: user.id,
    name: user.name,
    role: user.role,
  });
}
