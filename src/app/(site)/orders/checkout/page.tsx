"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  Button,
  Typography,
  Form,
  Input,
  DatePicker,
  Table,
  App,
  Alert,
  Spin,
} from "antd";
import {
  ShoppingCartOutlined,
  PhoneOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ArrowLeftOutlined,
  FileTextOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { fmtVND } from "@/lib/format";
import dayjs from "dayjs";
import Link from "next/link";

type CartItem = {
  id: number;
  name: string;
  unit: string;
  price: number;
  qty: number;
};

type UserInfo = {
  id: number;
  name: string;
  agent_id: number | null;
  agent_name?: string;
};

export default function CheckoutPage() {
  const router = useRouter();
  const { message, modal } = App.useApp();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    const savedCart = sessionStorage.getItem("dealerhub_cart");
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch {
        setCart([]);
      }
    }

    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setUser(data?.user || null))
      .finally(() => setLoadingUser(false));
  }, []);

  const cartTotal = cart.reduce((sum, c) => sum + c.price * c.qty, 0);

  const handleSubmit = async (values: { note?: string; delivery_date?: dayjs.Dayjs }) => {
    if (cart.length === 0) {
      message.error("Giỏ hàng trống");
      return;
    }

    if (!user?.agent_id) {
      message.error("Tài khoản chưa được gắn với đại lý. Vui lòng liên hệ admin.");
      return;
    }

    modal.confirm({
      title: "Xác nhận đặt hàng",
      content: (
        <div className="py-2">
          <p>Bạn có chắc chắn muốn đặt đơn hàng này?</p>
          <p className="mt-2 font-semibold text-blue-600">
            Tổng tiền: {fmtVND(cartTotal)}
          </p>
          <Alert
            type="info"
            className="mt-3"
            title="Nhân viên sẽ gọi điện xác nhận đơn hàng trong vòng 30 phút"
            showIcon
          />
        </div>
      ),
      okText: "Đặt hàng",
      cancelText: "Hủy",
      onOk: async () => {
        setLoading(true);
        try {
          const res = await fetch("/api/orders", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              agent_id: user.agent_id,
              items: cart.map((c) => ({
                product_id: c.id,
                qty: c.qty,
                price: c.price,
              })),
              note: values.note || "",
              delivery_date: values.delivery_date?.format("YYYY-MM-DD HH:mm") || null,
            }),
          });

          if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || "Đặt hàng thất bại");
          }

          sessionStorage.removeItem("dealerhub_cart");
          localStorage.removeItem("dealerhub_cart");

          message.success("Đặt hàng thành công! Nhân viên sẽ liên hệ xác nhận.");
          router.push("/orders");
        } catch (err: any) {
          message.error(err.message || "Đặt hàng thất bại");
        } finally {
          setLoading(false);
        }
      },
    });
  };

  if (loadingUser) {
    return (
      <div className="flex justify-center py-20">
        <Spin size="large" />
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="max-w-2xl mx-auto pb-20 lg:pb-4">
        <Card className="text-center py-12">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingCartOutlined className="text-4xl text-blue-400" />
          </div>
          <Typography.Title level={4} className="!mb-2">
            Giỏ hàng trống
          </Typography.Title>
          <Typography.Text type="secondary" className="block mb-4">
            Vui lòng thêm sản phẩm vào giỏ hàng trước khi thanh toán
          </Typography.Text>
          <Link href="/products">
            <Button type="primary" icon={<ShoppingCartOutlined />}>
              Xem sản phẩm
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto pb-20 lg:pb-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 mb-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <CheckCircleOutlined className="text-2xl" />
          </div>
          <div>
            <Typography.Title level={3} className="!m-0 !text-white">
              Xác nhận đơn hàng
            </Typography.Title>
            <Typography.Text className="!text-green-100">
              Kiểm tra và hoàn tất đặt hàng
            </Typography.Text>
          </div>
        </div>
      </div>

      {/* User & Agent Info */}
      <Card className="mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <UserOutlined className="text-blue-600" />
          </div>
          <div>
            <div className="font-medium">{user?.name}</div>
            <div className="text-sm text-gray-500">
              {user?.agent_name || "Đại lý: Chưa xác định"}
            </div>
          </div>
        </div>
      </Card>

      {/* Notice */}
      <Alert
        type="info"
        showIcon
        icon={<PhoneOutlined />}
        className="mb-4"
        title="Xác nhận qua điện thoại"
        description="Sau khi đặt hàng, nhân viên sẽ gọi điện xác nhận đơn hàng và thời gian giao hàng trong vòng 30 phút."
      />

      {/* Cart Items */}
      <Card
        title={
          <span className="flex items-center gap-2">
            <ShoppingCartOutlined />
            Sản phẩm ({cart.length})
          </span>
        }
        className="mb-4"
        styles={{ body: { padding: 0 } }}
      >
        <Table
          dataSource={cart}
          rowKey="id"
          pagination={false}
          size="small"
          columns={[
            {
              title: "Sản phẩm",
              dataIndex: "name",
              render: (v, r) => (
                <div>
                  <div className="font-medium">{v}</div>
                  <div className="text-xs text-gray-500">{r.unit}</div>
                </div>
              ),
            },
            {
              title: "SL",
              dataIndex: "qty",
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
              width: 140,
              render: (_, r) => (
                <span className="font-semibold text-blue-600">
                  {fmtVND(r.price * r.qty)}
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
                  {fmtVND(cartTotal)}
                </span>
              </Table.Summary.Cell>
            </Table.Summary.Row>
          )}
        />
      </Card>

      {/* Order Info */}
      <Card
        title={
          <span className="flex items-center gap-2">
            <FileTextOutlined />
            Thông tin đơn hàng
          </span>
        }
        className="mb-4"
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="delivery_date"
            label={
              <span className="flex items-center gap-2">
                <CalendarOutlined />
                Ngày giao hàng mong muốn
              </span>
            }
          >
            <DatePicker
              showTime={{ format: "HH:mm" }}
              className="w-full"
              format="DD/MM/YYYY HH:mm"
              placeholder="Chọn ngày giờ (tùy chọn)"
              disabledDate={(current) =>
                current && current < dayjs().startOf("day")
              }
            />
          </Form.Item>

          <Form.Item name="note" label="Ghi chú">
            <Input.TextArea
              rows={3}
              placeholder="Ghi chú cho đơn hàng (yêu cầu đặc biệt...)"
            />
          </Form.Item>

          <div className="flex gap-3">
            <Link href="/products" className="flex-1">
              <Button block icon={<ArrowLeftOutlined />}>
                Quay lại
              </Button>
            </Link>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              icon={<CheckCircleOutlined />}
              className="flex-1 !bg-gradient-to-r !from-green-500 !to-emerald-600 !border-0"
            >
              Đặt hàng
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
}
