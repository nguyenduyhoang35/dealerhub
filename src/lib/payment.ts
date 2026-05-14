// VietQR + SePay integration

const BANK_ID = process.env.SEPAY_BANK_ID || "MB"; // MB Bank, VCB, TCB, etc.
const ACCOUNT_NUMBER = process.env.SEPAY_ACCOUNT_NUMBER || "0123456789";
const ACCOUNT_NAME = process.env.SEPAY_ACCOUNT_NAME || "NGUYEN VAN A";
const TEMPLATE = "compact2"; // compact, compact2, qr_only, print

// Bank codes for VietQR
const BANK_NAMES: Record<string, string> = {
  MB: "MB Bank",
  VCB: "Vietcombank",
  TCB: "Techcombank",
  ACB: "ACB",
  TPB: "TPBank",
  VPB: "VPBank",
  BIDV: "BIDV",
  VIB: "VIB",
  MSB: "MSB",
  OCB: "OCB",
};

export function generateVietQR(amount: number, content: string) {
  // VietQR URL format: https://img.vietqr.io/image/{bank}-{account}-{template}.png?amount={amount}&addInfo={content}
  const qrUrl = `https://img.vietqr.io/image/${BANK_ID}-${ACCOUNT_NUMBER}-${TEMPLATE}.png?amount=${amount}&addInfo=${encodeURIComponent(content)}&accountName=${encodeURIComponent(ACCOUNT_NAME)}`;

  return {
    qr_url: qrUrl,
    bank_id: BANK_ID,
    bank_name: BANK_NAMES[BANK_ID] || BANK_ID,
    account_number: ACCOUNT_NUMBER,
    account_name: ACCOUNT_NAME,
    amount,
    content,
  };
}

export function generatePaymentContent(type: "order" | "debt", id: number, timestamp?: number) {
  const ts = timestamp || Date.now();
  if (type === "order") {
    return `DH${id}T${ts}`;
  }
  return `CN${id}T${ts}`;
}

export function parsePaymentContent(content: string) {
  // Parse "DH123T1234567890" or "CN456T1234567890"
  const orderMatch = content.match(/DH(\d+)T(\d+)/);
  if (orderMatch) {
    return { type: "order" as const, id: parseInt(orderMatch[1]), timestamp: parseInt(orderMatch[2]) };
  }

  const debtMatch = content.match(/CN(\d+)T(\d+)/);
  if (debtMatch) {
    return { type: "debt" as const, id: parseInt(debtMatch[1]), timestamp: parseInt(debtMatch[2]) };
  }

  return null;
}

// SePay webhook verification
const SEPAY_API_KEY = process.env.SEPAY_API_KEY || "";

export function verifySepayWebhook(authorization: string | null): boolean {
  if (!SEPAY_API_KEY) return true; // Skip verification if no key set
  return authorization === `Apikey ${SEPAY_API_KEY}`;
}
