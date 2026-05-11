"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Card,
  Row,
  Col,
  Statistic,
  Table,
  Typography,
  Empty,
  Tag,
  Spin,
} from "antd";
import {
  ShoppingOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  CarOutlined,
  RiseOutlined,
} from "@ant-design/icons";
import { fmtVND, STATUS_LABEL, STATUS_TAG } from "@/lib/format";

type Stats = {
  totals: {
    orders: number;
    revenue: number;
    paid: number;
    debt: number;
    pending: number;
    delivering: number;
    delivered: number;
    cancelled: number;
  };
  byAgent: {
    id: number;
    name: string;
    order_count: number;
    revenue: number;
    paid: number;
    debt: number;
  }[];
  todayByDriver: {
    id: number;
    name: string;
    vehicle_plate: string | null;
    orders: number;
    delivered: number;
    remaining: number;
    total_value: number;
    collected: number;
  }[];
  today: string;
  byMonth: { month: string; orders: number; revenue: number }[];
};

const fmtNum = (v: any) => new Intl.NumberFormat("vi-VN").format(Number(v));

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then(setStats);
  }, []);

  if (!stats)
    return (
      <div className="flex justify-center py-20">
        <Spin />
      </div>
    );

  const t = stats.totals;

  return (
    <div className="flex flex-col gap-3">
      <Typography.Title level={3} className="!m-0">Dashboard</Typography.Title>

      <Row gutter={[12, 12]}>
        <Col xs={12} md={6}>
          <StatCard
            label="Tổng đơn"
            value={fmtNum(t.orders)}
            icon={<ShoppingOutlined />}
            color="#475569"
            bg="#f1f5f9"
          />
        </Col>
        <Col xs={12} md={6}>
          <StatCard
            label="Doanh số"
            value={`${fmtNum(t.revenue)} ₫`}
            icon={<RiseOutlined />}
            color="#2563eb"
            bg="#dbeafe"
          />
        </Col>
        <Col xs={12} md={6}>
          <StatCard
            label="Đã thu"
            value={`${fmtNum(t.paid)} ₫`}
            icon={<CheckCircleOutlined />}
            color="#16a34a"
            bg="#dcfce7"
          />
        </Col>
        <Col xs={12} md={6}>
          <StatCard
            label="Công nợ"
            value={`${fmtNum(t.debt)} ₫`}
            icon={<WarningOutlined />}
            color="#dc2626"
            bg="#fee2e2"
          />
        </Col>
      </Row>

      <Card
        title={
          <span>
            <CarOutlined /> Hôm nay theo xe ({stats.today})
          </span>
        }
      >
        {stats.todayByDriver.length === 0 ? (
          <Empty
            description={
              <span>
                Chưa có tài xế. <Link href="/drivers">Thêm tài xế →</Link>
              </span>
            }
          />
        ) : (
          <Table
            dataSource={stats.todayByDriver}
            rowKey="id"
            pagination={false}
            size="middle"
            columns={[
              { title: "Tài xế", dataIndex: "name", render: (v) => <b>{v}</b> },
              {
                title: "Biển số",
                dataIndex: "vehicle_plate",
                render: (v) => v || <span className="text-slate-400">—</span>,
              },
              { title: "Tổng đơn", dataIndex: "orders", align: "right", width: 100 },
              {
                title: "Đã giao",
                dataIndex: "delivered",
                align: "right",
                width: 100,
                render: (v) => <span className="text-green-600">{v}</span>,
              },
              {
                title: "Còn lại",
                dataIndex: "remaining",
                align: "right",
                width: 100,
                render: (v) => (
                  <span className={v > 0 ? "text-amber-500" : "text-slate-400"}>{v}</span>
                ),
              },
              {
                title: "Giá trị",
                dataIndex: "total_value",
                align: "right",
                render: (v) => fmtVND(v),
              },
              {
                title: "Đã thu",
                dataIndex: "collected",
                align: "right",
                render: (v) => <b className="text-blue-600">{fmtVND(v)}</b>,
              },
            ]}
          />
        )}
      </Card>

      <Card title="Trạng thái đơn">
        <Row gutter={[12, 12]}>
          {(["pending", "delivering", "delivered", "cancelled"] as const).map((k) => (
            <Col xs={12} md={6} key={k}>
              <Card size="small">
                <Statistic
                  title={
                    <Tag color={STATUS_TAG[k] as any} className="!m-0">
                      {STATUS_LABEL[k]}
                    </Tag>
                  }
                  value={t[k] || 0}
                />
              </Card>
            </Col>
          ))}
        </Row>
      </Card>

      <Card title="Công nợ theo đại lý">
        {stats.byAgent.length === 0 ? (
          <Empty
            description={
              <span>
                Chưa có đại lý. <Link href="/agents">Thêm đại lý →</Link>
              </span>
            }
          />
        ) : (
          <Table
            dataSource={stats.byAgent}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            columns={[
              { title: "Đại lý", dataIndex: "name", render: (v) => <b>{v}</b> },
              { title: "Số đơn", dataIndex: "order_count", align: "right", width: 100 },
              {
                title: "Doanh số",
                dataIndex: "revenue",
                align: "right",
                render: (v) => fmtVND(v),
                sorter: (a, b) => a.revenue - b.revenue,
              },
              {
                title: "Đã trả",
                dataIndex: "paid",
                align: "right",
                render: (v) => fmtVND(v),
              },
              {
                title: "Còn nợ",
                dataIndex: "debt",
                align: "right",
                defaultSortOrder: "descend",
                sorter: (a, b) => a.debt - b.debt,
                render: (v) => (
                  <b style={{ color: v > 0 ? "#dc2626" : "#16a34a" }}>{fmtVND(v)}</b>
                ),
              },
            ]}
          />
        )}
      </Card>

      <Card title="Doanh số 6 tháng gần nhất">
        {stats.byMonth.length === 0 ? (
          <Empty />
        ) : (
          <Table
            dataSource={stats.byMonth}
            rowKey="month"
            pagination={false}
            size="middle"
            columns={[
              { title: "Tháng", dataIndex: "month" },
              { title: "Số đơn", dataIndex: "orders", align: "right" },
              {
                title: "Doanh số",
                dataIndex: "revenue",
                align: "right",
                render: (v) => fmtVND(v),
              },
            ]}
          />
        )}
      </Card>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  color,
  bg,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  color: string;
  bg: string;
}) {
  return (
    <Card styles={{ body: { padding: 16 } }}>
      <div className="flex items-center gap-3">
        <div
          className="flex items-center justify-center rounded-lg shrink-0"
          style={{ width: 48, height: 48, background: bg, color, fontSize: 22 }}
        >
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm text-slate-500 truncate">{label}</div>
          <div
            className="font-bold truncate"
            style={{ color, fontSize: 20, lineHeight: 1.2, marginTop: 2 }}
            title={value}
          >
            {value}
          </div>
        </div>
      </div>
    </Card>
  );
}
