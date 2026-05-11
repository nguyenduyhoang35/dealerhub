import { db } from "@/lib/db";
import { makeExcel, VND } from "@/lib/excel";

export async function GET() {
  const { data, error } = await db().from("products").select("*").order("name");
  if (error) return new Response(error.message, { status: 500 });

  const today = new Date().toISOString().slice(0, 10);
  return makeExcel(`san-pham-${today}.xlsx`, [
    {
      name: "Sản phẩm",
      columns: [
        { header: "Tên", key: "name", width: 36 },
        { header: "Đơn vị", key: "unit", width: 12 },
        { header: "Giá", key: "price", width: 16, numFmt: VND },
        { header: "Tồn kho", key: "stock", width: 12 },
      ],
      rows: data || [],
    },
  ]);
}
