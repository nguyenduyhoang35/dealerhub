import { formatCurrency, parseCurrency, formatCompact, parseCompact, getCurrencyConfig } from "currency-fomatter";

const vndConfig = getCurrencyConfig("VND");

export function fmtVND(n: number): string {
  return formatCurrency(n, vndConfig);
}

export function parseVND(str: string): number {
  const result = parseCurrency(str, vndConfig);
  return result?.floatValue ?? 0;
}

export function fmtVNDCompact(n: number): string {
  return formatCompact(n, {
    compactDisplay: { thousand: " nghìn", million: " triệu", billion: " tỷ" },
    suffix: " ₫",
  });
}

export function parseVNDCompact(str: string): number {
  const result = parseCompact(str);
  return result?.floatValue ?? 0;
}

export const vndInputProps = {
  formatter: (v: any) => formatCurrency(v ?? 0, { ...vndConfig, suffix: "" }),
  parser: (v: any) => parseCurrency(v || "0", vndConfig)?.floatValue as any,
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
