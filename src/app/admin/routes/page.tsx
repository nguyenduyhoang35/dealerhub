"use client";
import { useEffect, useMemo, useState } from "react";
import {
  Card,
  Button,
  Select,
  DatePicker,
  Typography,
  Empty,
  Table,
  Alert,
  Tag,
  Space,
  App,
  Tooltip,
  Progress,
  Avatar,
} from "antd";
import {
  PhoneOutlined,
  EnvironmentOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  CloseOutlined,
  CarOutlined,
  CheckCircleTwoTone,
  PrinterOutlined,
} from "@ant-design/icons";
import dayjs, { Dayjs } from "dayjs";
import { fmtVND } from "@/lib/format";

type Driver = { id: number; name: string; vehicle_plate: string | null; role: string; active: number };
type Order = {
  id: number;
  agent_name: string;
  agent_address: string | null;
  agent_phone: string | null;
  user_id: number | null;
  route_order: number | null;
  status: string;
  total: number;
  delivery_date: string | null;
  items: { product_name: string; quantity: number; product_unit: string }[];
};

export default function RoutesPage() {
  const { message } = App.useApp();
  const [date, setDate] = useState<Dayjs>(dayjs());
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [unassigned, setUnassigned] = useState<Order[]>([]);

  const dateStr = date.format("YYYY-MM-DD");

  const load = async () => {
    const [d, byDate, un] = await Promise.all([
      fetch("/api/users").then((r) => r.json()),
      fetch(`/api/orders?date=${dateStr}`).then((r) => r.json()),
      fetch(`/api/orders?unassigned=1`).then((r) => r.json()),
    ]);
    const driverList = Array.isArray(d) ? d : [];
    const orderList = Array.isArray(byDate) ? byDate : [];
    const unassignedList = Array.isArray(un) ? un : [];
    setDrivers(driverList.filter((x: Driver) => x.role === "driver" && x.active));
    setOrders(orderList);
    setUnassigned(unassignedList.filter((o: Order) => !o.delivery_date || o.delivery_date === dateStr));
  };

  useEffect(() => {
    load();
  }, [dateStr]);

  const grouped = useMemo(() => {
    const map: Record<number, Order[]> = {};
    drivers.forEach((d) => (map[d.id] = []));
    orders
      .filter((o) => o.user_id)
      .forEach((o) => ((map[o.user_id!] = map[o.user_id!] || []).push(o)));
    Object.keys(map).forEach((k) => {
      map[+k].sort((a, b) => (a.route_order ?? 9999) - (b.route_order ?? 9999));
    });
    return map;
  }, [orders, drivers]);

  const orphan = orders.filter((o) => !o.user_id);
  const allToAssign = [...orphan, ...unassigned.filter((u) => !orders.find((o) => o.id === u.id))];

  const assignTo = async (orderId: number, driverId: number | null) => {
    await fetch("/api/routes/assign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        assignments: [{ order_id: orderId, user_id: driverId, delivery_date: dateStr }],
      }),
    });
    message.success(driverId ? "Đã gán xe" : "Đã gỡ khỏi xe");
    load();
  };

  const move = async (orderId: number, driverId: number, dir: -1 | 1) => {
    const list = grouped[driverId];
    const idx = list.findIndex((o) => o.id === orderId);
    const next = idx + dir;
    if (next < 0 || next >= list.length) return;
    const newList = [...list];
    [newList[idx], newList[next]] = [newList[next], newList[idx]];
    await fetch("/api/routes/assign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        assignments: newList.map((o, i) => ({
          order_id: o.id,
          user_id: driverId,
          route_order: i + 1,
        })),
      }),
    });
    load();
  };

  return (
    <>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <Typography.Title level={3} className="!m-0 hidden sm:block">
          Lên tuyến giao hàng
        </Typography.Title>
        <Space wrap className="!ml-auto">
          <DatePicker
            value={date}
            onChange={(d) => d && setDate(d)}
            format="YYYY-MM-DD"
            allowClear={false}
          />
          <Button onClick={() => setDate(dayjs())}>Hôm nay</Button>
          <Button
            type="primary"
            icon={<PrinterOutlined />}
            href={`/api/export/delivery-slip?date=${dateStr}`}
          >
            <span className="hidden sm:inline">In phiếu giao</span>
            <span className="sm:hidden">In</span>
          </Button>
        </Space>
      </div>

      {allToAssign.length > 0 && (
        <Card
          className="mb-4 border-l-4 border-l-orange-500"
          title={
            <Space>
              <Alert
                type="warning"
                showIcon
                title={`${allToAssign.length} đơn chưa gán xe`}
                className="!py-0 !border-0 !bg-transparent !p-0"
              />
            </Space>
          }
        >
          <Typography.Text type="secondary" className="block mb-3">
            Chọn tài xế để gán cho ngày {dateStr}
          </Typography.Text>
          <Table
            dataSource={allToAssign}
            rowKey="id"
            pagination={false}
            size="small"
            scroll={{ x: 900 }}
            columns={[
              { title: "#", dataIndex: "id", width: 60, render: (v) => `#${v}` },
              { title: "Đại lý", dataIndex: "agent_name", render: (v) => <b>{v}</b> },
              {
                title: "Địa chỉ",
                dataIndex: "agent_address",
                render: (v) => <span className="text-slate-500">{v || "—"}</span>,
              },
              {
                title: "Hàng",
                render: (_, r) => (
                  <span className="text-xs text-slate-500">
                    {r.items.map((i) => `${i.product_name} ×${i.quantity}`).join(", ")}
                  </span>
                ),
              },
              {
                title: "Tổng",
                dataIndex: "total",
                align: "right",
                width: 130,
                render: (v) => fmtVND(v),
              },
              {
                title: "Gán cho",
                width: 220,
                render: (_, r) => (
                  <Select
                    placeholder="Chọn xe"
                    style={{ width: "100%" }}
                    onChange={(v) => assignTo(r.id, v)}
                    options={drivers.map((d) => ({
                      value: d.id,
                      label: `${d.name}${d.vehicle_plate ? ` (${d.vehicle_plate})` : ""}`,
                    }))}
                  />
                ),
              },
            ]}
          />
        </Card>
      )}

      <Typography.Title level={4} className="!mb-3">
        Tuyến từng xe — {dateStr}
      </Typography.Title>

      {drivers.length === 0 ? (
        <Card>
          <Empty description="Chưa có tài xế. Vào trang Người dùng để thêm." />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {drivers.map((d) => {
            const list = grouped[d.id] || [];
            const totalValue = list.reduce((s, o) => s + o.total, 0);
            const delivered = list.filter((o) => o.status === "delivered").length;
            const percent = list.length > 0 ? Math.round((delivered / list.length) * 100) : 0;
            return (
              <Card
                key={d.id}
                styles={{ header: { padding: "12px 16px" }, body: { padding: 12 } }}
                title={
                  <div className="flex items-center gap-3">
                    <Avatar
                      size={40}
                      style={{ background: "#dbeafe", color: "#2563eb" }}
                      icon={<CarOutlined />}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-base truncate">{d.name}</div>
                      {d.vehicle_plate && (
                        <Tag color="blue" className="!m-0 !text-xs">
                          {d.vehicle_plate}
                        </Tag>
                      )}
                    </div>
                  </div>
                }
              >
                <div className="mb-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-500">
                      {delivered}/{list.length} đã giao
                    </span>
                    <span className="font-semibold text-blue-600">{fmtVND(totalValue)}</span>
                  </div>
                  <Progress
                    percent={percent}
                    showInfo={false}
                    strokeColor={percent === 100 ? "#16a34a" : "#2563eb"}
                    size="small"
                  />
                </div>

                {list.length === 0 ? (
                  <Empty
                    description={<span className="text-xs text-slate-400">Chưa có đơn</span>}
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                ) : (
                  <div className="flex flex-col gap-2">
                    {list.map((o, i) => {
                      const done = o.status === "delivered";
                      return (
                        <div
                          key={o.id}
                          className={`rounded-lg border transition-colors ${
                            done
                              ? "bg-green-50/50 border-green-200"
                              : "bg-white border-slate-200 hover:border-blue-400"
                          }`}
                        >
                          <div className="flex">
                            <div
                              className={`flex items-center justify-center font-bold text-sm rounded-l-lg shrink-0 ${
                                done ? "bg-green-500 text-white" : "bg-slate-100 text-slate-600"
                              }`}
                              style={{ width: 32 }}
                            >
                              {done ? <CheckCircleTwoTone twoToneColor="#fff" /> : i + 1}
                            </div>

                            <div className="flex-1 min-w-0 p-2.5">
                              <div className="flex items-start justify-between gap-2">
                                <div className="font-semibold text-sm truncate flex-1">
                                  {o.agent_name}
                                </div>
                                <Space size={0}>
                                  <Tooltip title="Lên">
                                    <Button
                                      type="text"
                                      size="small"
                                      icon={<ArrowUpOutlined />}
                                      disabled={i === 0}
                                      onClick={() => move(o.id, d.id, -1)}
                                    />
                                  </Tooltip>
                                  <Tooltip title="Xuống">
                                    <Button
                                      type="text"
                                      size="small"
                                      icon={<ArrowDownOutlined />}
                                      disabled={i === list.length - 1}
                                      onClick={() => move(o.id, d.id, 1)}
                                    />
                                  </Tooltip>
                                  <Tooltip title="Gỡ khỏi xe">
                                    <Button
                                      type="text"
                                      size="small"
                                      danger
                                      icon={<CloseOutlined />}
                                      onClick={() => assignTo(o.id, null)}
                                    />
                                  </Tooltip>
                                </Space>
                              </div>
                              {o.agent_address && (
                                <div className="text-xs text-slate-500 truncate mt-0.5">
                                  📍 {o.agent_address}
                                </div>
                              )}
                              <div className="text-xs text-slate-600 mt-1 line-clamp-2">
                                {o.items.map((it) => `${it.product_name} ×${it.quantity}`).join(", ")}
                              </div>
                              <div className="flex justify-between items-center mt-1.5 text-xs">
                                <span className="font-semibold text-blue-600">
                                  {fmtVND(o.total)}
                                </span>
                                {o.agent_phone && (
                                  <a
                                    href={`tel:${o.agent_phone}`}
                                    className="text-blue-600 hover:text-blue-800"
                                  >
                                    <PhoneOutlined /> {o.agent_phone}
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </>
  );
}
