import { db } from "@/lib/db";
import { makeExcel, VND } from "@/lib/excel";

export async function GET() {
  const [{ data: agents, error: aErr }, { data: stats, error: sErr }] = await Promise.all([
    db().from("agents").select("*").order("name"),
    db().rpc("stats_by_agent"),
  ]);
  if (aErr || sErr) return new Response((aErr || sErr)!.message, { status: 500 });

  const statsMap = new Map<number, any>();
  (stats || []).forEach((s: any) => statsMap.set(Number(s.id), s));

  const rows = (agents || []).map((a: any) => {
    const s = statsMap.get(Number(a.id)) || {
      order_count: 0,
      revenue: 0,
      paid: 0,
      debt: 0,
    };
    return {
      name: a.name,
      phone: a.phone || "",
      address: a.address || "",
      note: a.note || "",
      order_count: Number(s.order_count) || 0,
      revenue: Number(s.revenue) || 0,
      paid: Number(s.paid) || 0,
      debt: Number(s.debt) || 0,
    };
  });

  const today = new Date().toISOString().slice(0, 10);
  return makeExcel(`cong-no-dai-ly-${today}.xlsx`, [
    {
      name: "Đại lý",
      columns: [
        { header: "Tên", key: "name", width: 30 },
        { header: "SĐT", key: "phone", width: 14 },
        { header: "Địa chỉ", key: "address", width: 40 },
        { header: "Ghi chú", key: "note", width: 24 },
        { header: "Số đơn", key: "order_count", width: 10 },
        { header: "Doanh số", key: "revenue", width: 18, numFmt: VND },
        { header: "Đã trả", key: "paid", width: 18, numFmt: VND },
        { header: "Còn nợ", key: "debt", width: 18, numFmt: VND },
      ],
      rows,
    },
  ]);
}
