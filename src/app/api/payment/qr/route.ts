import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { generateVietQR, generatePaymentContent } from "@/lib/payment";

export async function POST(req: NextRequest) {
  const user = await currentUser();
  if (!user) {
    return NextResponse.json({ error: "Vui lòng đăng nhập" }, { status: 401 });
  }

  const { type, order_id, agent_id, amount } = await req.json();

  if (!amount || amount <= 0) {
    return NextResponse.json({ error: "Số tiền không hợp lệ" }, { status: 400 });
  }

  let content: string;
  let id: number;

  if (type === "order" && order_id) {
    id = order_id;
    content = generatePaymentContent("order", order_id);
  } else if (type === "debt" && agent_id) {
    id = agent_id;
    content = generatePaymentContent("debt", agent_id);
  } else {
    return NextResponse.json({ error: "Thiếu thông tin thanh toán" }, { status: 400 });
  }

  const qrData = generateVietQR(amount, content);

  return NextResponse.json({
    ...qrData,
    type,
    order_id: type === "order" ? id : null,
    agent_id: type === "debt" ? id : null,
    expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 minutes
  });
}
