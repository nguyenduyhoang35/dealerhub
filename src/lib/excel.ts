import ExcelJS from "exceljs";
import { NextResponse } from "next/server";

export type ColumnDef = {
  header: string;
  key: string;
  width?: number;
  numFmt?: string;
};

export async function makeExcel(
  filename: string,
  sheets: { name: string; columns: ColumnDef[]; rows: any[] }[]
): Promise<NextResponse> {
  const wb = new ExcelJS.Workbook();
  wb.creator = "DealerHub";
  wb.created = new Date();

  for (const s of sheets) {
    const ws = wb.addWorksheet(s.name);
    ws.columns = s.columns.map((c) => ({
      header: c.header,
      key: c.key,
      width: c.width || 18,
      style: c.numFmt ? { numFmt: c.numFmt } : undefined,
    }));
    ws.addRows(s.rows);
    ws.getRow(1).eachCell((cell) => {
      cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF2563EB" },
      };
      cell.alignment = { vertical: "middle", horizontal: "center" };
      cell.border = {
        top: { style: "thin" },
        bottom: { style: "thin" },
        left: { style: "thin" },
        right: { style: "thin" },
      };
    });
    ws.getRow(1).height = 24;
    ws.views = [{ state: "frozen", ySplit: 1 }];
  }

  const buf = await wb.xlsx.writeBuffer();
  return new NextResponse(buf, {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${encodeURIComponent(filename)}"`,
    },
  });
}

export const VND = "#,##0 ₫";
export const DATE = "yyyy-mm-dd";
