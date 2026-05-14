"use client";
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
import { useAdminStats } from "@/hooks";

const fmtNum = (v: any) => new Intl.NumberFormat("vi-VN").format(Number(v));

export default function Dashboard() {
  const { data: stats, isLoading, isError } = useAdminStats();

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Spin />
      </div>
    );
  }

  if (isError || !stats) {
    return (
      <Card className="text-center py-12">
        <Empty description="Lỗi tải dữ liệu" />
      </Card>
    );
  }

  const t = stats.totals || { orders: 0, revenue: 0, paid: 0, debt: 0, pending: 0, delivering: 0, delivered: 0, cancelled: 0 };

  return (
    <div className="flex flex-col gap-3">
      <Typography.Title level={3} className="!m-0 hidden sm:block">
        Dashboard
      </Typography.Title>

      <Row gutter={[8, 8]}>
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
        styles={{ header: { padding: "8px 12px" }, body: { padding: 12 } }}
      >
        {stats.todayByDriver.length === 0 ? (
          <Empty
            description={
              <span>
                Chưa có tài xế. <Link href="/admin/users">Thêm tài xế →</Link>
              </span>
            }
          />
        ) : (
          <Table
            dataSource={stats.todayByDriver}
            rowKey="id"
            pagination={false}
            size="middle"
            scroll={{ x: 900 }}
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

      <Card
        title="Trạng thái đơn"
        styles={{ header: { padding: "8px 12px" }, body: { padding: 12 } }}
      >
        <Row gutter={[8, 8]}>
          {(["pending", "delivering", "delivered", "cancelled"] as const).map((k) => (
            <Col xs={12} md={6} key={k}>
              <Card size="small" styles={{ body: { padding: 10 } }}>
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

      <Card
        title="Công nợ theo đại lý"
        styles={{ header: { padding: "8px 12px" }, body: { padding: 12 } }}
      >
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
            scroll={{ x: 720 }}
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

      <Card
        title="Doanh số 6 tháng gần nhất"
        styles={{ header: { padding: "8px 12px" }, body: { padding: 12 } }}
      >
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
    <Card styles={{ body: { padding: 12 } }}>
      <div className="flex items-center gap-2.5">
        <div
          className="flex items-center justify-center rounded-lg shrink-0"
          style={{ width: 40, height: 40, background: bg, color, fontSize: 20 }}
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
