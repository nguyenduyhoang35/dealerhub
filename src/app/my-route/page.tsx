"use client";
import { useEffect, useState } from "react";
import {
  Card,
  Button,
  DatePicker,
  Typography,
  Empty,
  Tag,
  Space,
  Statistic,
  Row,
  Col,
  Collapse,
  InputNumber,
  App,
  Modal,
} from "antd";
import {
  PhoneOutlined,
  EnvironmentOutlined,
  CheckOutlined,
  CarOutlined,
  CheckCircleTwoTone,
} from "@ant-design/icons";
import dayjs, { Dayjs } from "dayjs";
import { fmtVND, STATUS_LABEL, STATUS_TAG, vndInputProps } from "@/lib/format";

type Order = {
  id: number;
  agent_name: string;
  agent_address: string | null;
  agent_phone: string | null;
  status: string;
  total: number;
  paid: number;
  collected_amount: number;
  delivery_date: string | null;
  note: string | null;
  items: { product_name: string; quantity: number; product_unit: string; price: number }[];
};

export default function MyRoutePage() {
  const { message, modal } = App.useApp();
  const [date, setDate] = useState<Dayjs>(dayjs());
  const [orders, setOrders] = useState<Order[]>([]);

  const dateStr = date.format("YYYY-MM-DD");

  const load = async () => {
    const r = await fetch(`/api/orders?mine=1&date=${dateStr}`);
    setOrders(await r.json());
  };
  useEffect(() => {
    load();
  }, [dateStr]);

  const total = orders.reduce((s, o) => s + o.total, 0);
  const delivered = orders.filter((o) => o.status === "delivered");
  const collected = orders.reduce((s, o) => s + o.collected_amount, 0);
  const remaining = orders.filter((o) => o.status !== "delivered" && o.status !== "cancelled");

  const updateStatus = async (id: number, status: string, extra: any = {}) => {
    await fetch(`/api/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, ...extra }),
    });
    load();
  };

  const askDeliver = (o: Order) => {
    let value = o.total - o.paid;
    modal.confirm({
      title: `Giao đơn cho ${o.agent_name}`,
      icon: <CheckCircleTwoTone twoToneColor="#16a34a" />,
      content: (
        <div className="mt-3">
          <Typography.Text>Số tiền thu tại điểm:</Typography.Text>
          <InputNumber
            autoFocus
            className="!w-full !mt-2"
            size="large"
            min={0}
            defaultValue={value}
            {...vndInputProps}
            onChange={(v) => (value = Number(v) || 0)}
          />
          <div className="mt-2 flex gap-2">
            <Button size="small" onClick={() => (value = o.total - o.paid)}>
              Đủ ({fmtVND(o.total - o.paid)})
            </Button>
            <Button size="small" onClick={() => (value = 0)}>
              Ghi nợ
            </Button>
          </div>
        </div>
      ),
      okText: "✓ Đã giao",
      cancelText: "Hủy",
      okButtonProps: { type: "primary" },
      async onOk() {
        await updateStatus(o.id, "delivered", {
          collected_amount: value,
          paid: o.paid + value,
        });
        message.success("Đã giao xong");
      },
    });
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <Typography.Title level={3} className="!m-0">
          <CarOutlined /> Tuyến của tôi
        </Typography.Title>
        <Space>
          <DatePicker
            value={date}
            onChange={(d) => d && setDate(d)}
            allowClear={false}
            format="YYYY-MM-DD"
          />
          <Button onClick={() => setDate(dayjs())}>Hôm nay</Button>
        </Space>
      </div>

      <Row gutter={[8, 8]} className="mb-3">
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic title="Tổng đơn" value={orders.length} />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic title="Đã giao" value={delivered.length} valueStyle={{ color: "#16a34a" }} />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic title="Còn lại" value={remaining.length} valueStyle={{ color: "#f59e0b" }} />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title="Đã thu"
              value={collected}
              suffix="₫"
              valueStyle={{ color: "#2563eb" }}
              formatter={(v) => new Intl.NumberFormat("vi-VN").format(Number(v))}
            />
          </Card>
        </Col>
      </Row>

      {orders.length === 0 ? (
        <Card>
          <Empty description="Hôm nay chưa có đơn nào được giao cho bạn" />
        </Card>
      ) : (
        <Collapse
          accordion
          items={orders.map((o, idx) => ({
            key: String(o.id),
            label: (
              <div className="flex justify-between items-start gap-2 pr-2">
                <div className="flex-1 min-w-0">
                  <div className="font-semibold truncate">
                    {idx + 1}. {o.agent_name}
                    {o.status === "delivered" && (
                      <CheckCircleTwoTone twoToneColor="#16a34a" className="ml-1" />
                    )}
                  </div>
                  <div className="text-xs text-slate-500 truncate">
                    {o.agent_address || "—"}
                  </div>
                  <div className="text-xs mt-1">
                    📦 {o.items.length} mặt hàng · <b>{fmtVND(o.total)}</b>
                  </div>
                </div>
                <Tag color={STATUS_TAG[o.status] as any} className="whitespace-nowrap">
                  {STATUS_LABEL[o.status]}
                </Tag>
              </div>
            ),
            children: (
              <div>
                <Space className="mb-3 flex-wrap">
                  {o.agent_phone && (
                    <a href={`tel:${o.agent_phone}`}>
                      <Button type="primary" icon={<PhoneOutlined />} className="!bg-green-600 hover:!bg-green-700">
                        Gọi {o.agent_phone}
                      </Button>
                    </a>
                  )}
                  {o.agent_address && (
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(o.agent_address)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button icon={<EnvironmentOutlined />}>Mở Maps</Button>
                    </a>
                  )}
                </Space>

                <Card size="small" className="!bg-slate-50 mb-3">
                  {o.items.map((it, i) => (
                    <div key={i} className="flex justify-between text-sm py-1">
                      <span>{it.product_name}</span>
                      <span className="text-slate-600">
                        ×{it.quantity} {it.product_unit} · {fmtVND(it.quantity * it.price)}
                      </span>
                    </div>
                  ))}
                  <div className="border-t border-slate-300 mt-2 pt-2 flex justify-between font-bold">
                    <span>Tổng</span>
                    <span>{fmtVND(o.total)}</span>
                  </div>
                </Card>

                {o.note && (
                  <Typography.Text type="secondary" className="!block mb-3">
                    📝 {o.note}
                  </Typography.Text>
                )}

                {o.status !== "delivered" ? (
                  <Space wrap className="w-full">
                    <Button
                      type="primary"
                      size="large"
                      icon={<CheckOutlined />}
                      className="!bg-green-600 hover:!bg-green-700"
                      onClick={() => askDeliver(o)}
                    >
                      Đã giao
                    </Button>
                    {o.status === "pending" && (
                      <Button size="large" onClick={() => updateStatus(o.id, "delivering")}>
                        Đang giao
                      </Button>
                    )}
                    <Button danger size="large" onClick={() => updateStatus(o.id, "cancelled")}>
                      Hủy
                    </Button>
                  </Space>
                ) : (
                  <Card size="small" className="!bg-green-50 !border-green-200">
                    <div>
                      ✓ Đã thu tại điểm: <b>{fmtVND(o.collected_amount)}</b>
                    </div>
                    {o.total - o.paid > 0 && (
                      <div className="text-red-600 mt-1">
                        Còn nợ: {fmtVND(o.total - o.paid)}
                      </div>
                    )}
                  </Card>
                )}
              </div>
            ),
          }))}
        />
      )}

      <Card size="small" className="!sticky !bottom-0 !mt-4 !shadow-lg">
        <div className="flex justify-between text-sm">
          <span>Tổng cần thu hôm nay:</span>
          <b>{fmtVND(total)}</b>
        </div>
        <div className="flex justify-between text-sm mt-1">
          <span>Đã thu:</span>
          <b className="text-green-600">{fmtVND(collected)}</b>
        </div>
      </Card>
    </div>
  );
}
