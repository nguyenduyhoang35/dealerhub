import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifySepayWebhook, parsePaymentContent } from "@/lib/payment";

// SePay webhook format:
// {
//   "id": 123,
//   "gateway": "MBBank",
//   "transactionDate": "2024-01-01 12:00:00",
//   "accountNumber": "0123456789",
//   "subAccount": null,
//   "transferType": "in",
//   "transferAmount": 100000,
//   "accumulated": 1000000,
//   "code": null,
//   "content": "DH123T1234567890",
//   "referenceCode": "FT12345678",
//   "description": "Chuyen tien"
// }

type SepayWebhookPayload = {
  id: number;
  gateway: string;
  transactionDate: string;
  accountNumber: string;
  transferType: "in" | "out";
  transferAmount: number;
  content: string;
  referenceCode: string;
  description: string;
};

export async function POST(req: NextRequest) {
  // Verify webhook signature
  const authorization = req.headers.get("Authorization");
  if (!verifySepayWebhook(authorization)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload: SepayWebhookPayload = await req.json();

  // Only process incoming transfers
  if (payload.transferType !== "in") {
    return NextResponse.json({ success: true, message: "Ignored outgoing transfer" });
  }

  const amount = payload.transferAmount;
  const content = payload.content || "";
  const bankRef = payload.referenceCode;

  // Parse payment content to get order/agent ID
  const parsed = parsePaymentContent(content);

  if (!parsed) {
    // Unknown payment format - log for manual review
    console.log("Unknown payment content:", content, "Amount:", amount);
    return NextResponse.json({ success: true, message: "Unknown payment format" });
  }

  if (parsed.type === "order") {
    // Update order paid amount
    const { data: order } = await db()
      .from("orders")
      .select("id, paid, total")
      .eq("id", parsed.id)
      .maybeSingle();

    if (order) {
      const newPaid = Math.min(order.paid + amount, order.total);
      await db()
        .from("orders")
        .update({ paid: newPaid })
        .eq("id", order.id);

      console.log(`Order #${order.id}: paid updated ${order.paid} -> ${newPaid}`);
    }
  } else if (parsed.type === "debt") {
    // Debt payment - find oldest unpaid orders for this agent and apply payment
    const { data: orders } = await db()
      .from("orders")
      .select("id, paid, total")
      .eq("agent_id", parsed.id)
      .order("created_at", { ascending: true });

    // Filter orders with debt and apply payment
    const ordersWithDebt = (orders || []).filter((o) => o.total > o.paid);

    if (ordersWithDebt.length > 0) {
      let remaining = amount;

      for (const order of ordersWithDebt) {
        if (remaining <= 0) break;

        const debt = order.total - order.paid;
        const payAmount = Math.min(remaining, debt);

        await db()
          .from("orders")
          .update({ paid: order.paid + payAmount })
          .eq("id", order.id);

        remaining -= payAmount;
        console.log(`Debt payment: Order #${order.id} paid +${payAmount}`);
      }
    }
  }

  // Log transaction for audit
  await db().from("payment_transactions").insert({
    order_id: parsed.type === "order" ? parsed.id : null,
    agent_id: parsed.type === "debt" ? parsed.id : null,
    amount,
    content,
    bank_ref: bankRef,
    status: "completed",
    completed_at: new Date().toISOString(),
  });

  return NextResponse.json({ success: true });
}
