"use client";
import { useState } from "react";
import { Modal, Typography, Button, message, Alert } from "antd";
import CommonInputNumber from "@/components/CommonInputNumber";
import { QrcodeOutlined, CopyOutlined, CheckCircleOutlined } from "@ant-design/icons";
import { fmtVND } from "@/lib/format";

type PaymentModalProps = {
  open: boolean;
  onClose: () => void;
  type: "order" | "debt";
  orderId?: number;
  agentId?: number;
  maxAmount: number;
  onSuccess?: () => void;
};

type QRData = {
  qr_url: string;
  bank_name: string;
  account_number: string;
  account_name: string;
  amount: number;
  content: string;
  expires_at: string;
};

export default function PaymentModal({
  open,
  onClose,
  type,
  orderId,
  agentId,
  maxAmount,
  onSuccess,
}: PaymentModalProps) {
  const [amount, setAmount] = useState<number>(maxAmount);
  const [loading, setLoading] = useState(false);
  const [qrData, setQrData] = useState<QRData | null>(null);
  const [copied, setCopied] = useState(false);

  const generateQR = async () => {
    if (!amount || amount <= 0) {
      message.error("Vui lòng nhập số tiền");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/payment/qr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          order_id: orderId,
          agent_id: agentId,
          amount,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Lỗi tạo mã QR");
      }

      const data = await res.json();
      setQrData(data);
    } catch (err: any) {
      message.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    message.success("Đã copy");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClose = () => {
    setQrData(null);
    setAmount(maxAmount);
    onClose();
  };

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      footer={null}
      title={
        <span className="flex items-center gap-2">
          <QrcodeOutlined className="text-blue-600" />
          {type === "order" ? "Thanh toán đơn hàng" : "Thanh toán công nợ"}
        </span>
      }
      width={420}
    >
      {!qrData ? (
        <div className="py-4">
          <div className="mb-4">
            <Typography.Text className="block mb-2">Số tiền thanh toán:</Typography.Text>
            <div className="flex">
              <CommonInputNumber
                value={amount}
                onChange={(v) => setAmount(Number(v) || 0)}
                min={1000}
                max={maxAmount}
                className="flex-1 !rounded-r-none"
                size="large"
              />
              <span className="inline-flex items-center px-3 bg-slate-100 border border-l-0 border-slate-300 rounded-r-lg text-slate-600">
                VNĐ
              </span>
            </div>
            <Typography.Text type="secondary" className="text-xs mt-1 block">
              Tối đa: {fmtVND(maxAmount)}
            </Typography.Text>
          </div>

          <div className="flex gap-2">
            <Button
              type="primary"
              icon={<QrcodeOutlined />}
              onClick={generateQR}
              loading={loading}
              block
              size="large"
            >
              Tạo mã QR
            </Button>
          </div>
        </div>
      ) : (
        <div className="text-center py-4">
          <Alert
            type="info"
            showIcon
            title="Quét mã QR bằng app ngân hàng để thanh toán"
            className="mb-4"
          />

          <div className="bg-white p-4 rounded-xl border inline-block mb-4">
            <img
              src={qrData.qr_url}
              alt="QR Code"
              className="w-64 h-64 object-contain"
            />
          </div>

          <div className="bg-slate-50 rounded-xl p-4 text-left mb-4">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <span className="text-slate-500">Ngân hàng:</span>
              <span className="font-medium">{qrData.bank_name}</span>

              <span className="text-slate-500">Số TK:</span>
              <span className="font-medium flex items-center gap-1">
                {qrData.account_number}
                <CopyOutlined
                  className="text-blue-500 cursor-pointer"
                  onClick={() => copyToClipboard(qrData.account_number)}
                />
              </span>

              <span className="text-slate-500">Chủ TK:</span>
              <span className="font-medium">{qrData.account_name}</span>

              <span className="text-slate-500">Số tiền:</span>
              <span className="font-bold text-blue-600">{fmtVND(qrData.amount)}</span>

              <span className="text-slate-500">Nội dung CK:</span>
              <span className="font-medium flex items-center gap-1">
                {qrData.content}
                <CopyOutlined
                  className="text-blue-500 cursor-pointer"
                  onClick={() => copyToClipboard(qrData.content)}
                />
              </span>
            </div>
          </div>

          <Alert
            type="warning"
            title="Vui lòng giữ nguyên nội dung chuyển khoản để hệ thống tự động ghi nhận"
            className="mb-4 text-left"
          />

          <div className="flex gap-2">
            <Button onClick={() => setQrData(null)} block>
              Đổi số tiền
            </Button>
            <Button
              type="primary"
              icon={<CheckCircleOutlined />}
              onClick={() => {
                message.success("Hệ thống sẽ tự động cập nhật khi nhận được tiền");
                onSuccess?.();
                handleClose();
              }}
              block
            >
              Đã chuyển khoản
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
