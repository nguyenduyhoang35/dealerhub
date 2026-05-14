"use client";
import { use } from "react";
import Link from "next/link";
import {
  Card,
  Typography,
  Table,
  Tag,
  Descriptions,
  Button,
  Spin,
  Empty,
} from "antd";
import {
  ArrowLeftOutlined,
  FileTextOutlined,
  CalendarOutlined,
  UserOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";
import { fmtVND, STATUS_LABEL, STATUS_TAG } from "@/lib/format";
import { useOrder } from "@/hooks";
import dayjs from "dayjs";

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: order, isLoading, isError } = useOrder(id);

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Spin size="large" />
      </div>
    );
  }

  if (isError || !order) {
    return (
      <Card className="text-center py-12">
        <Empty description="Không tìm thấy đơn hàng" />
        <Link href="/orders">
          <Button type="primary" className="mt-4">
            Quay lại danh sách
          </Button>
        </Link>
      </Card>
    );
  }

  const debt = order.total - order.paid;

  return (
    <div className="max-w-4xl mx-auto pb-20 lg:pb-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-6 mb-6 text-white">
        <div className="flex items-center gap-3 mb-4">
          <Link href="/orders">
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              className="!text-white hover:!bg-white/20"
            />
          </Link>
          <div className="flex-1">
            <Typography.Title level={3} className="!m-0 !text-white">
              Đơn hàng #{order.id}
            </Typography.Title>
            <Typography.Text className="!text-purple-100">
              {dayjs(order.created_at).format("DD/MM/YYYY HH:mm")}
            </Typography.Text>
          </div>
          <Tag
            color={STATUS_TAG[order.status as keyof typeof STATUS_TAG]}
            className="!text-base !px-3 !py-1"
          >
            {STATUS_LABEL[order.status as keyof typeof STATUS_LABEL]}
          </Tag>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white/10 rounded-xl p-3 text-center">
            <div className="text-sm text-purple-200">Tổng tiền</div>
            <div className="text-xl font-bold">{fmtVND(order.total)}</div>
          </div>
          <div className="bg-white/10 rounded-xl p-3 text-center">
            <div className="text-sm text-green-200">Đã trả</div>
            <div className="text-xl font-bold text-green-200">
              {fmtVND(order.paid)}
            </div>
          </div>
          <div className="bg-white/10 rounded-xl p-3 text-center">
            <div
              className="text-sm"
              style={{ color: debt > 0 ? "#fecaca" : "#bbf7d0" }}
            >
              Còn nợ
            </div>
            <div
              className="text-xl font-bold"
              style={{ color: debt > 0 ? "#fecaca" : "#bbf7d0" }}
            >
              {fmtVND(debt)}
            </div>
          </div>
        </div>
      </div>

      {/* Order Info */}
      <Card className="mb-4">
        <Descriptions column={{ xs: 1, sm: 2 }} size="small">
          <Descriptions.Item
            label={
              <span>
                <UserOutlined className="mr-1" /> Đại lý
              </span>
            }
          >
            {order.agent_name}
          </Descriptions.Item>
          {order.agent_phone && (
            <Descriptions.Item
              label={
                <span>
                  <PhoneOutlined className="mr-1" /> Điện thoại
                </span>
              }
            >
              <a href={`tel:${order.agent_phone}`} className="text-blue-600">
                {order.agent_phone}
              </a>
            </Descriptions.Item>
          )}
          {order.agent_address && (
            <Descriptions.Item
              label={
                <span>
                  <EnvironmentOutlined className="mr-1" /> Địa chỉ
                </span>
              }
              span={2}
            >
              {order.agent_address}
            </Descriptions.Item>
          )}
          <Descriptions.Item
            label={
              <span>
                <CalendarOutlined className="mr-1" /> Ngày giao
              </span>
            }
          >
            {order.delivery_date
              ? dayjs(order.delivery_date).format("DD/MM/YYYY HH:mm")
              : "Chưa xác định"}
          </Descriptions.Item>
          {order.driver_name && (
            <Descriptions.Item label="Tài xế">
              {order.driver_name}
              {order.driver_plate && ` (${order.driver_plate})`}
            </Descriptions.Item>
          )}
          {order.note && (
            <Descriptions.Item label="Ghi chú" span={2}>
              {order.note}
            </Descriptions.Item>
          )}
        </Descriptions>
      </Card>

      {/* Order Items */}
      <Card
        title={
          <span className="flex items-center gap-2">
            <FileTextOutlined />
            Chi tiết sản phẩm
          </span>
        }
        styles={{ body: { padding: 0 } }}
      >
        <Table
          dataSource={order.items || []}
          rowKey="id"
          pagination={false}
          size="small"
          columns={[
            {
              title: "Sản phẩm",
              dataIndex: "product_name",
              render: (v, r: any) => (
                <div>
                  <div className="font-medium">{v}</div>
                  <div className="text-xs text-gray-500">{r.product_unit}</div>
                </div>
              ),
            },
            {
              title: "SL",
              dataIndex: "quantity",
              align: "center",
              width: 60,
            },
            {
              title: "Đơn giá",
              dataIndex: "price",
              align: "right",
              width: 120,
              render: (v) => fmtVND(v),
            },
            {
              title: "Thành tiền",
              align: "right",
              width: 130,
              render: (_, r: any) => (
                <span className="font-semibold text-blue-600">
                  {fmtVND(r.price * r.quantity)}
                </span>
              ),
            },
          ]}
          summary={() => (
            <Table.Summary.Row className="bg-slate-50">
              <Table.Summary.Cell index={0} colSpan={3}>
                <span className="font-semibold">Tổng cộng</span>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={1} align="right">
                <span className="text-lg font-bold text-blue-600">
                  {fmtVND(order.total)}
                </span>
              </Table.Summary.Cell>
            </Table.Summary.Row>
          )}
        />
      </Card>
    </div>
  );
}
