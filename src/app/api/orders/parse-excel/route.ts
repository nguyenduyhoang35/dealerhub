import { NextRequest, NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Chưa chọn file" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);

    const sheet = workbook.worksheets[0];
    if (!sheet) {
      return NextResponse.json({ error: "File Excel rỗng" }, { status: 400 });
    }

    const { data: products } = await db()
      .from("products")
      .select("id, name, unit, price")
      .eq("active", true);

    const productMap = new Map(products?.map((p) => [p.id, p]) || []);
    const productByName = new Map(products?.map((p) => [p.name.toLowerCase(), p]) || []);

    const items: {
      product_id: number;
      product_name: string;
      unit: string;
      quantity: number;
      price: number;
      total: number;
    }[] = [];

    sheet.eachRow((row, rowNum) => {
      if (rowNum === 1) return;

      const idCell = row.getCell(1).value;
      const nameCell = row.getCell(2).value;
      const qtyCell = row.getCell(6).value;

      const qty = typeof qtyCell === "number" ? qtyCell : parseInt(String(qtyCell || "0"), 10);
      if (!qty || qty <= 0) return;

      let product = null;

      if (idCell && typeof idCell === "number") {
        product = productMap.get(idCell);
      }

      if (!product && nameCell) {
        const name = String(nameCell).toLowerCase().trim();
        product = productByName.get(name);
      }

      if (product) {
        items.push({
          product_id: product.id,
          product_name: product.name,
          unit: product.unit,
          quantity: qty,
          price: product.price,
          total: qty * product.price,
        });
      }
    });

    if (items.length === 0) {
      return NextResponse.json(
        { error: "Không tìm thấy sản phẩm nào có số lượng > 0" },
        { status: 400 }
      );
    }

    return NextResponse.json({ items });
  } catch (err) {
    console.error("Parse Excel error:", err);
    return NextResponse.json({ error: "Lỗi đọc file Excel" }, { status: 500 });
  }
}
