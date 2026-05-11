export function fmtVND(n: number): string {
  return new Intl.NumberFormat("vi-VN").format(n) + " ₫";
}

export const vndInputProps = {
  formatter: (v: any) => `${v ?? ""}`.replace(/\B(?=(\d{3})+(?!\d))/g, "."),
  parser: (v: any) => Number((v || "").replace(/\D/g, "")) as any,
};

export const STATUS_LABEL: Record<string, string> = {
  pending: "Chờ giao",
  delivering: "Đang giao",
  delivered: "Đã giao",
  cancelled: "Đã hủy",
};

export const STATUS_COLOR: Record<string, string> = {
  pending: "#b58900",
  delivering: "#1e88e5",
  delivered: "#2e7d32",
  cancelled: "#c62828",
};

export const STATUS_TAG: Record<string, string> = {
  pending: "warning",
  delivering: "processing",
  delivered: "success",
  cancelled: "error",
};
