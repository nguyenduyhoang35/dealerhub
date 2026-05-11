import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const today = new Date().toISOString().slice(0, 10);

  const [totalsRes, byAgentRes, byDriverRes, byMonthRes] = await Promise.all([
    db().rpc("stats_totals"),
    db().rpc("stats_by_agent"),
    db().rpc("stats_today_by_driver", { p_date: today }),
    db().rpc("stats_by_month"),
  ]);

  if (totalsRes.error || byAgentRes.error || byDriverRes.error || byMonthRes.error) {
    return NextResponse.json(
      {
        error:
          totalsRes.error?.message ||
          byAgentRes.error?.message ||
          byDriverRes.error?.message ||
          byMonthRes.error?.message,
      },
      { status: 500 }
    );
  }

  const totals = (totalsRes.data && totalsRes.data[0]) || {
    orders: 0,
    revenue: 0,
    paid: 0,
    debt: 0,
    pending: 0,
    delivering: 0,
    delivered: 0,
    cancelled: 0,
  };

  return NextResponse.json({
    totals,
    byAgent: byAgentRes.data || [],
    todayByDriver: byDriverRes.data || [],
    byMonth: byMonthRes.data || [],
    today,
  });
}
