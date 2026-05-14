import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { makeExcel, VND } from "@/lib/excel";

const STATUS_LABEL: Record<string, string> = {
  pending: "Chờ giao",
  delivering: "Đang giao",
  delivered: "Đã giao",
  cancelled: "Đã hủy",
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const status = searchParams.get("status");
  const driverId = searchParams.get("user_id");

  let q = db()
    .from("orders")
    .select(
      `id, status, total, paid, collected_amount, delivery_date, delivered_at, note, created_at,
       agent:agents(name, phone, address),
       driver:users(name, vehicle_plate),
       items:order_items(quantity, price, product:products(name, unit))`
    );
  if (from) q = q.gte("delivery_date", from);
  if (to) q = q.lte("delivery_date", to);
  if (status) q = q.eq("status", status);
  if (driverId) q = q.eq("user_id", Number(driverId));
  q = q.order("delivery_date", { ascending: false }).order("id");

  const { data, error } = await q;
  if (error) return new Response(error.message, { status: 500 });

  const summary = (data || []).map((o: any) => ({
    id: o.id,
    agent: o.agent?.name || "",
    phone: o.agent?.phone || "",
    address: o.agent?.address || "",
    driver: o.driver?.name || "",
    plate: o.driver?.vehicle_plate || "",
    delivery_date: o.delivery_date || "",
    delivered_at: o.delivered_at ? new Date(o.delivered_at).toLocaleString("vi-VN") : "",
    status: STATUS_LABEL[o.status] || o.status,
    total: o.total,
    paid: o.paid,
    debt: o.total - o.paid,
    collected: o.collected_amount,
    items_count: (o.items || []).length,
    note: o.note || "",
  }));

  const detail: any[] = [];
  for (const o of data || []) {
    for (const it of (o as any).items || []) {
      detail.push({
        order_id: o.id,
        agent: (o as any).agent?.name || "",
        delivery_date: o.delivery_date || "",
        status: STATUS_LABEL[o.status] || o.status,
        product: it.product?.name || "",
        unit: it.product?.unit || "",
        quantity: it.quantity,
        price: it.price,
        amount: it.quantity * it.price,
      });
    }
  }

  const today = new Date().toISOString().slice(0, 10);
  return makeExcel(`don-hang-${today}.xlsx`, [
    {
      name: "Đơn hàng",
      columns: [
        { header: "Mã đơn", key: "id", width: 10 },
        { header: "Đại lý", key: "agent", width: 28 },
        { header: "SĐT", key: "phone", width: 14 },
        { header: "Địa chỉ", key: "address", width: 36 },
        { header: "Tài xế", key: "driver", width: 18 },
        { header: "Biển số", key: "plate", width: 14 },
        { header: "Ngày giao", key: "delivery_date", width: 14 },
        { header: "Giao lúc", key: "delivered_at", width: 22 },
        { header: "Trạng thái", key: "status", width: 14 },
        { header: "Tổng", key: "total", width: 16, numFmt: VND },
        { header: "Đã trả", key: "paid", width: 16, numFmt: VND },
        { header: "Còn nợ", key: "debt", width: 16, numFmt: VND },
        { header: "Thu tại điểm", key: "collected", width: 16, numFmt: VND },
        { header: "Số mặt hàng", key: "items_count", width: 12 },
        { header: "Ghi chú", key: "note", width: 24 },
      ],
      rows: summary,
    },
    {
      name: "Chi tiết",
      columns: [
        { header: "Mã đơn", key: "order_id", width: 10 },
        { header: "Đại lý", key: "agent", width: 28 },
        { header: "Ngày giao", key: "delivery_date", width: 14 },
        { header: "Trạng thái", key: "status", width: 14 },
        { header: "Sản phẩm", key: "product", width: 32 },
        { header: "Đơn vị", key: "unit", width: 10 },
        { header: "SL", key: "quantity", width: 8 },
        { header: "Đơn giá", key: "price", width: 16, numFmt: VND },
        { header: "Thành tiền", key: "amount", width: 18, numFmt: VND },
      ],
      rows: detail,
    },
  ]);
}
