import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const user = await currentUser();
  if (user?.role !== "admin")
    return NextResponse.json({ error: "Không có quyền" }, { status: 403 });

  const { assignments } = await req.json();
  if (!Array.isArray(assignments))
    return NextResponse.json({ error: "Sai định dạng" }, { status: 400 });

  for (const a of assignments) {
    const update: any = {
      driver_id: a.driver_id ? Number(a.driver_id) : null,
      route_order:
        a.route_order === null || a.route_order === undefined ? null : Number(a.route_order),
    };
    if (a.delivery_date) update.delivery_date = a.delivery_date;

    const { error } = await db().from("orders").update(update).eq("id", Number(a.order_id));
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
