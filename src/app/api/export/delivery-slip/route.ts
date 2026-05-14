import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { makeExcel, VND } from "@/lib/excel";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date") || new Date().toISOString().slice(0, 10);

  const { data: drivers, error: dErr } = await db()
    .from("users")
    .select("id, name, vehicle_plate")
    .eq("role", "driver")
    .eq("active", true)
    .order("name");
  if (dErr) return new Response(dErr.message, { status: 500 });

  const { data: orders, error: oErr } = await db()
    .from("orders")
    .select(
      `id, status, total, paid, route_order, note, user_id,
       agent:agents(name, phone, address),
       items:order_items(quantity, price, product:products(name, unit))`
    )
    .eq("delivery_date", date)
    .not("user_id", "is", null)
    .order("user_id")
    .order("route_order", { ascending: true, nullsFirst: false });
  if (oErr) return new Response(oErr.message, { status: 500 });

  const sheets: any[] = [];

  for (const d of drivers || []) {
    const driverOrders = (orders || []).filter((o: any) => o.user_id === d.id);
    if (driverOrders.length === 0) continue;

    const rows: any[] = [];
    let stt = 1;
    for (const o of driverOrders) {
      const items = (o as any).items || [];
      const itemsStr = items
        .map((it: any) => `${it.product?.name || ""} ×${it.quantity}`)
        .join(", ");

      rows.push({
        stt: stt++,
        order_id: `#${o.id}`,
        agent: (o as any).agent?.name || "",
        phone: (o as any).agent?.phone || "",
        address: (o as any).agent?.address || "",
        items: itemsStr,
        total: o.total,
        paid: o.paid,
        debt: o.total - o.paid,
        note: o.note || "",
        sign: "",
      });
    }

    const sheetName = `${d.name}${d.vehicle_plate ? ` (${d.vehicle_plate})` : ""}`.slice(0, 31);
    sheets.push({
      name: sheetName,
      columns: [
        { header: "STT", key: "stt", width: 6 },
        { header: "Mã đơn", key: "order_id", width: 10 },
        { header: "Đại lý", key: "agent", width: 28 },
        { header: "SĐT", key: "phone", width: 14 },
        { header: "Địa chỉ", key: "address", width: 38 },
        { header: "Hàng hóa", key: "items", width: 50 },
        { header: "Tổng", key: "total", width: 14, numFmt: VND },
        { header: "Đã trả", key: "paid", width: 14, numFmt: VND },
        { header: "Cần thu", key: "debt", width: 14, numFmt: VND },
        { header: "Ghi chú", key: "note", width: 18 },
        { header: "Ký nhận", key: "sign", width: 16 },
      ],
      rows,
    });
  }

  if (sheets.length === 0) {
    sheets.push({
      name: "Trống",
      columns: [{ header: "Thông báo", key: "msg", width: 50 }],
      rows: [{ msg: `Không có đơn giao ngày ${date}` }],
    });
  }

  return makeExcel(`phieu-giao-${date}.xlsx`, sheets);
}
