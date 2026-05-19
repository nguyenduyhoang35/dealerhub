import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const user = await currentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const page = Number(searchParams.get("page")) || 1;
  const limit = Math.min(Number(searchParams.get("limit")) || 20, 100);
  const search = searchParams.get("search") || "";
  const hasDebt = searchParams.get("hasDebt"); // "true" | "false" | null

  // Get all agents with debt stats using RPC
  const { data: stats, error: statsErr } = await db().rpc("stats_by_agent");
  if (statsErr) {
    return NextResponse.json({ error: statsErr.message }, { status: 500 });
  }

  // Get all agents
  const { data: agents, error: agentsErr } = await db()
    .from("agents")
    .select("id, name, phone, address")
    .order("name");

  if (agentsErr) {
    return NextResponse.json({ error: agentsErr.message }, { status: 500 });
  }

  // Merge agents with stats
  const statsMap = new Map<number, any>();
  (stats || []).forEach((s: any) => statsMap.set(Number(s.id), s));

  let results = (agents || []).map((a: any) => {
    const s = statsMap.get(Number(a.id)) || {
      order_count: 0,
      revenue: 0,
      paid: 0,
      debt: 0,
    };
    return {
      id: a.id,
      name: a.name,
      phone: a.phone,
      address: a.address,
      order_count: Number(s.order_count) || 0,
      revenue: Number(s.revenue) || 0,
      paid: Number(s.paid) || 0,
      debt: Number(s.debt) || 0,
    };
  });

  // Filter by search
  if (search) {
    const q = search.toLowerCase();
    results = results.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        (r.phone && r.phone.includes(q)) ||
        (r.address && r.address.toLowerCase().includes(q))
    );
  }

  // Filter by hasDebt
  if (hasDebt === "true") {
    results = results.filter((r) => r.debt > 0);
  } else if (hasDebt === "false") {
    results = results.filter((r) => r.debt <= 0);
  }

  // Calculate totals
  const totals = {
    total_agents: results.length,
    total_revenue: results.reduce((sum, r) => sum + r.revenue, 0),
    total_paid: results.reduce((sum, r) => sum + r.paid, 0),
    total_debt: results.reduce((sum, r) => sum + r.debt, 0),
    agents_with_debt: results.filter((r) => r.debt > 0).length,
  };

  // Sort by debt descending
  results.sort((a, b) => b.debt - a.debt);

  // Paginate
  const total = results.length;
  const paginatedResults = results.slice((page - 1) * limit, page * limit);

  return NextResponse.json({
    data: paginatedResults,
    totals,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}
