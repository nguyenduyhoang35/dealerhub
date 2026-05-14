import { NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { db } from "@/lib/db";

export async function GET() {
  const { data: products } = await db()
    .from("products")
    .select("id, name, unit, price, categories(name)")
    .eq("active", true)
    .order("category_id")
    .order("name");

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Đặt hàng");

  sheet.columns = [
    { header: "Mã SP", key: "id", width: 10 },
    { header: "Tên sản phẩm", key: "name", width: 35 },
    { header: "Danh mục", key: "category", width: 20 },
    { header: "ĐVT", key: "unit", width: 10 },
    { header: "Đơn giá", key: "price", width: 15 },
    { header: "Số lượng", key: "qty", width: 12 },
    { header: "Thành tiền", key: "total", width: 15 },
  ];

  const headerRow = sheet.getRow(1);
  headerRow.font = { bold: true };
  headerRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFE0E0E0" },
  };

  products?.forEach((p: any, idx: number) => {
    const rowNum = idx + 2;
    sheet.addRow({
      id: p.id,
      name: p.name,
      category: p.categories?.name || "",
      unit: p.unit,
      price: p.price,
      qty: 0,
      total: { formula: `E${rowNum}*F${rowNum}` },
    });
  });

  const lastRow = (products?.length || 0) + 2;
  sheet.addRow({
    id: "",
    name: "",
    category: "",
    unit: "",
    price: "TỔNG CỘNG",
    qty: "",
    total: { formula: `SUM(G2:G${lastRow - 1})` },
  });
  const totalRow = sheet.getRow(lastRow);
  totalRow.font = { bold: true };

  sheet.getColumn("qty").eachCell((cell, rowNum) => {
    if (rowNum > 1 && rowNum < lastRow) {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFFFFFCC" },
      };
    }
  });

  const buffer = await workbook.xlsx.writeBuffer();

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="mau-dat-hang.xlsx"`,
    },
  });
}
