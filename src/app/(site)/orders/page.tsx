"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { Card, Table, Tag, Typography, Empty, Spin, Button } from "antd";
import {
  FileExcelOutlined,
  EyeOutlined,
  FileTextOutlined,
  ShoppingCartOutlined,
} from "@ant-design/icons";
import {
  fmtVND,
  STATUS_LABEL,
  STATUS_TAG,
  PAYMENT_STATUS_LABEL,
  PAYMENT_STATUS_TAG,
} from "@/lib/format";
import { useOrders } from "@/hooks";
import dayjs from "dayjs";

const STATUS_OPTIONS = [
  { label: "Tất cả", value: "all" },
  { label: "Chờ xử lý", value: "pending" },
  { label: "Đang giao", value: "delivering" },
  { label: "Đã giao", value: "delivered" },
  { label: "Đã hủy", value: "cancelled" },
];

export default function OrdersPage() {
  const [statusFilter, setStatusFilter] = useState("all");
  const { data, isLoading, isError } = useOrders({ status: statusFilter !== "all" ? statusFilter : undefined });

  const orders = data?.data || [];

  const stats = useMemo(
    () => ({
      total: orders.length,
      pending: orders.filter((o) => o.status === "pending").length,
      delivering: orders.filter((o) => o.status === "delivering").length,
      delivered: orders.filter((o) => o.status === "delivered").length,
    }),
    [orders]
  );

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Spin size="large" />
      </div>
    );
  }

  if (isError) {
    return (
      <Card className="text-center py-12">
        <Empty description="Lỗi tải đơn hàng" />
      </Card>
    );
  }

  return (
    <div className="max-w-6xl mx-auto pb-20 lg:pb-4">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-6 sm:p-8 mb-6 text-white">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <Typography.Title level={3} className="!m-0 !mb-1 !text-white">
              <FileTextOutlined className="mr-2" />
              Đơn hàng của tôi
            </Typography.Title>
            <Typography.Text className="!text-purple-100">
              {stats.total} đơn hàng
            </Typography.Text>
          </div>
          <div className="flex gap-2">
            <Link href="/products">
              <Button icon={<ShoppingCartOutlined />} className="!bg-white/20 !text-white !border-white/30 hover:!bg-white/30">
                Đặt hàng mới
              </Button>
            </Link>
            <Link href="/orders/upload">
              <Button type="primary" icon={<FileExcelOutlined />} className="!bg-white !text-purple-600 !border-0">
                Đặt qua Excel
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3 mt-6">
          <div className="bg-white/10 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-xs text-purple-200">Tổng đơn</div>
          </div>
          <div className="bg-white/10 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-yellow-300">{stats.pending}</div>
            <div className="text-xs text-purple-200">Chờ xử lý</div>
          </div>
          <div className="bg-white/10 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-blue-300">{stats.delivering}</div>
            <div className="text-xs text-purple-200">Đang giao</div>
          </div>
          <div className="bg-white/10 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-green-300">{stats.delivered}</div>
            <div className="text-xs text-purple-200">Đã giao</div>
          </div>
        </div>
      </div>

      {/* Status Filter */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {STATUS_OPTIONS.map((opt) => (
          <Button
            key={opt.value}
            type={statusFilter === opt.value ? "primary" : "default"}
            size="small"
            onClick={() => setStatusFilter(opt.value)}
          >
            {opt.label}
          </Button>
        ))}
      </div>

      {orders.length === 0 ? (
        <Card className="text-center py-12">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileTextOutlined className="text-4xl text-purple-400" />
          </div>
          <Typography.Text type="secondary" className="text-base block mb-4">
            Chưa có đơn hàng nào
          </Typography.Text>
          <div className="flex justify-center gap-3">
            <Link href="/products">
              <Button type="primary" icon={<ShoppingCartOutlined />}>
                Đặt hàng ngay
              </Button>
            </Link>
            <Link href="/orders/upload">
              <Button icon={<FileExcelOutlined />}>
                Đặt qua Excel
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        <Card styles={{ body: { padding: 0 } }} className="overflow-hidden">
          <Table
            dataSource={orders}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            scroll={{ x: 800 }}
            columns={[
              {
                title: "Mã đơn",
                dataIndex: "id",
                width: 80,
                render: (v) => (
                  <span className="font-mono font-semibold text-purple-600">#{v}</span>
                ),
              },
              {
                title: "Ngày đặt",
                dataIndex: "created_at",
                width: 140,
                render: (v) => dayjs(v).format("DD/MM/YYYY HH:mm"),
              },
              {
                title: "Ngày giao",
                dataIndex: "delivery_date",
                width: 140,
                render: (v) => (v ? dayjs(v).format("DD/MM/YYYY HH:mm") : "—"),
              },
              {
                title: "Tổng tiền",
                dataIndex: "total",
                align: "right",
                width: 120,
                render: (v) => <b className="text-slate-800">{fmtVND(v)}</b>,
              },
              {
                title: "Đã trả",
                dataIndex: "paid",
                align: "right",
                width: 120,
                render: (v) => <span className="text-green-600 font-medium">{fmtVND(v)}</span>,
              },
              {
                title: "Giao hàng",
                dataIndex: "status",
                width: 110,
                render: (v) => (
                  <Tag color={STATUS_TAG[v as keyof typeof STATUS_TAG]}>
                    {STATUS_LABEL[v as keyof typeof STATUS_LABEL]}
                  </Tag>
                ),
              },
              {
                title: "Thanh toán",
                dataIndex: "payment_status",
                width: 120,
                render: (v: string) => (
                  <Tag color={PAYMENT_STATUS_TAG[v]}>
                    {PAYMENT_STATUS_LABEL[v]}
                  </Tag>
                ),
              },
              {
                title: "",
                width: 100,
                render: (_, record) => (
                  <Link href={`/orders/${record.id}`}>
                    <Button type="primary" ghost icon={<EyeOutlined />} size="small">
                      Chi tiết
                    </Button>
                  </Link>
                ),
              },
            ]}
          />
        </Card>
      )}
    </div>
  );
}
