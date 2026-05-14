"use client";
import { useEffect, useState } from "react";
import { Card, Table, Typography, Empty, Spin, Tag } from "antd";
import {
  DollarOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  WalletOutlined,
} from "@ant-design/icons";
import { fmtVND, STATUS_LABEL, STATUS_TAG } from "@/lib/format";
import dayjs from "dayjs";

type DebtInfo = {
  total_orders: number;
  total_revenue: number;
  total_paid: number;
  total_debt: number;
  recent_orders: {
    id: number;
    total: number;
    paid: number;
    status: string;
    created_at: string;
  }[];
};

export default function DebtPage() {
  const [data, setData] = useState<DebtInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/debt")
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spin size="large" />
      </div>
    );
  }

  if (!data) {
    return (
      <Card className="text-center py-12">
        <Empty description="Không thể tải thông tin công nợ" />
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-20 lg:pb-4">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl p-6 sm:p-8 mb-6 text-white">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <WalletOutlined className="text-2xl" />
          </div>
          <div>
            <Typography.Title level={3} className="!m-0 !text-white">
              Công nợ
            </Typography.Title>
            <Typography.Text className="!text-orange-100">
              Thông tin thanh toán của bạn
            </Typography.Text>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <div className="flex items-center gap-2 text-orange-100 text-sm mb-1">
              <DollarOutlined />
              <span>Tổng mua hàng</span>
            </div>
            <div className="text-2xl font-bold">{fmtVND(data.total_revenue)}</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <div className="flex items-center gap-2 text-green-200 text-sm mb-1">
              <CheckCircleOutlined />
              <span>Đã thanh toán</span>
            </div>
            <div className="text-2xl font-bold text-green-200">{fmtVND(data.total_paid)}</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <div className="flex items-center gap-2 text-sm mb-1" style={{ color: data.total_debt > 0 ? "#fecaca" : "#bbf7d0" }}>
              <WarningOutlined />
              <span>Còn nợ</span>
            </div>
            <div
              className="text-2xl font-bold"
              style={{ color: data.total_debt > 0 ? "#fecaca" : "#bbf7d0" }}
            >
              {fmtVND(data.total_debt)}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <Card
        title={
          <span className="text-lg font-semibold">
            Đơn hàng gần đây
          </span>
        }
        styles={{ body: { padding: 0 } }}
        className="overflow-hidden"
      >
        {data.recent_orders.length === 0 ? (
          <div className="py-12 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <DollarOutlined className="text-3xl text-orange-400" />
            </div>
            <Typography.Text type="secondary">Chưa có đơn hàng</Typography.Text>
          </div>
        ) : (
          <Table
            dataSource={data.recent_orders}
            rowKey="id"
            pagination={false}
            columns={[
              {
                title: "Mã đơn",
                dataIndex: "id",
                render: (v) => <span className="font-mono font-semibold text-orange-600">#{v}</span>,
              },
              {
                title: "Ngày",
                dataIndex: "created_at",
                render: (v) => dayjs(v).format("DD/MM/YYYY"),
              },
              {
                title: "Tổng tiền",
                dataIndex: "total",
                align: "right",
                render: (v) => <b>{fmtVND(v)}</b>,
              },
              {
                title: "Đã trả",
                dataIndex: "paid",
                align: "right",
                render: (v) => <span className="text-green-600 font-medium">{fmtVND(v)}</span>,
              },
              {
                title: "Còn nợ",
                align: "right",
                render: (_, r) => {
                  const debt = r.total - r.paid;
                  return (
                    <span className={debt > 0 ? "text-red-600 font-bold" : "text-green-600 font-medium"}>
                      {fmtVND(debt)}
                    </span>
                  );
                },
              },
              {
                title: "Trạng thái",
                dataIndex: "status",
                render: (v) => (
                  <Tag color={STATUS_TAG[v as keyof typeof STATUS_TAG]}>
                    {STATUS_LABEL[v as keyof typeof STATUS_LABEL]}
                  </Tag>
                ),
              },
            ]}
          />
        )}
      </Card>
    </div>
  );
}
