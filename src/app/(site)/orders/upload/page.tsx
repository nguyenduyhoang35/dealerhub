"use client";
import { useState } from "react";
import Link from "next/link";
import { Card, Upload, Button, Typography, Steps, Table, Alert, message, Result } from "antd";
import {
  DownloadOutlined,
  UploadOutlined,
  FileExcelOutlined,
  CheckCircleOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import { fmtVND } from "@/lib/format";

type OrderItem = {
  product_name: string;
  unit: string;
  qty: number;
  price: number;
  total: number;
};

export default function UploadOrderPage() {
  const [step, setStep] = useState(0);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [orderId, setOrderId] = useState<number | null>(null);

  const handleUpload = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/orders/parse-excel", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        message.error(err.error || "Lỗi đọc file Excel");
        return false;
      }

      const data = await res.json();
      setItems(data.items);
      setStep(1);
    } catch {
      message.error("Lỗi upload file");
    }
    return false;
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });

      if (!res.ok) {
        const err = await res.json();
        message.error(err.error || "Lỗi tạo đơn hàng");
        return;
      }

      const data = await res.json();
      setOrderId(data.id);
      setStep(2);
      message.success("Đặt hàng thành công!");
    } finally {
      setSubmitting(false);
    }
  };

  const total = items.reduce((sum, i) => sum + i.total, 0);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/orders">
          <Button icon={<ArrowLeftOutlined />} type="text">
            Quay lại
          </Button>
        </Link>
        <Typography.Title level={3} className="!m-0">
          Đặt hàng theo Excel
        </Typography.Title>
      </div>

      <Steps
        current={step}
        items={[
          { title: "Tải file", icon: <FileExcelOutlined /> },
          { title: "Xác nhận", icon: <CheckCircleOutlined /> },
          { title: "Hoàn tất", icon: <CheckCircleOutlined /> },
        ]}
        className="mb-8"
      />

      {step === 0 && (
        <Card>
          <div className="text-center py-8">
            <FileExcelOutlined className="text-6xl text-green-600 mb-4" />
            <Typography.Title level={4}>Upload file Excel đặt hàng</Typography.Title>
            <Typography.Text type="secondary" className="block mb-6">
              Tải mẫu Excel, điền số lượng cần đặt rồi upload lên hệ thống
            </Typography.Text>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Button
                icon={<DownloadOutlined />}
                href="/api/export/order-template"
                target="_blank"
              >
                Tải mẫu Excel
              </Button>
              <Upload
                accept=".xlsx,.xls"
                showUploadList={false}
                beforeUpload={handleUpload}
              >
                <Button type="primary" icon={<UploadOutlined />}>
                  Upload file đặt hàng
                </Button>
              </Upload>
            </div>

            <Alert
              type="info"
              showIcon
              title="Hướng dẫn"
              description={
                <ul className="text-left mt-2 space-y-1">
                  <li>1. Tải mẫu Excel về máy</li>
                  <li>2. Điền số lượng vào cột "Số lượng"</li>
                  <li>3. Upload file lên hệ thống</li>
                  <li>4. Kiểm tra và xác nhận đơn hàng</li>
                </ul>
              }
            />
          </div>
        </Card>
      )}

      {step === 1 && (
        <Card>
          <Typography.Title level={4} className="mb-4">
            Xác nhận đơn hàng
          </Typography.Title>

          <Table
            dataSource={items}
            rowKey="product_name"
            pagination={false}
            scroll={{ x: 600 }}
            columns={[
              { title: "Sản phẩm", dataIndex: "product_name" },
              { title: "ĐVT", dataIndex: "unit", width: 80 },
              { title: "SL", dataIndex: "qty", align: "right", width: 80 },
              {
                title: "Đơn giá",
                dataIndex: "price",
                align: "right",
                width: 120,
                render: (v) => fmtVND(v),
              },
              {
                title: "Thành tiền",
                dataIndex: "total",
                align: "right",
                width: 120,
                render: (v) => <b>{fmtVND(v)}</b>,
              },
            ]}
            summary={() => (
              <Table.Summary.Row>
                <Table.Summary.Cell index={0} colSpan={4}>
                  <b>Tổng cộng</b>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={4} align="right">
                  <b className="text-lg text-blue-600">{fmtVND(total)}</b>
                </Table.Summary.Cell>
              </Table.Summary.Row>
            )}
          />

          <div className="flex justify-end gap-3 mt-6">
            <Button onClick={() => setStep(0)}>Chọn file khác</Button>
            <Button type="primary" loading={submitting} onClick={handleSubmit}>
              Xác nhận đặt hàng
            </Button>
          </div>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <Result
            status="success"
            title="Đặt hàng thành công!"
            subTitle={`Mã đơn hàng: #${orderId}. Chúng tôi sẽ liên hệ xác nhận và giao hàng sớm nhất.`}
            extra={[
              <Link href={`/orders/${orderId}`} key="view">
                <Button type="primary">Xem đơn hàng</Button>
              </Link>,
              <Link href="/orders" key="list">
                <Button>Danh sách đơn hàng</Button>
              </Link>,
            ]}
          />
        </Card>
      )}
    </div>
  );
}
