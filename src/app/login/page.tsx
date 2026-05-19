"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Form, Input, Button, Card, Typography, Alert, App } from "antd";
import { PhoneOutlined, LockOutlined } from "@ant-design/icons";

export default function LoginPage() {
  const router = useRouter();
  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const onFinish = async (values: { phone: string; pin: string }) => {
    setErr("");
    setLoading(true);
    const r = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    setLoading(false);
    if (!r.ok) {
      const e = await r.json();
      setErr(e.error || "Đăng nhập thất bại");
      return;
    }
    const data = await r.json();
    message.success(`Xin chào ${data.name}`);

    // Redirect based on role
    let redirectUrl = "/";
    if (data.role === "superadmin" || data.role === "admin") {
      redirectUrl = "/admin";
    } else if (data.role === "driver") {
      redirectUrl = "/my-route";
    } else {
      redirectUrl = "/products";
    }
    router.push(redirectUrl);
    router.refresh();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-slate-100 p-4">
      <Card className="w-full max-w-sm shadow-xl border-0">
        <div className="text-center mb-6">
          <div className="text-5xl mb-2">📦</div>
          <Typography.Title level={2} className="!mt-0 !mb-1">
            DealerHub
          </Typography.Title>
          <Typography.Text type="secondary" className="text-sm">
            Quản lý giao hàng đại lý
          </Typography.Text>
        </div>

        <Form layout="vertical" onFinish={onFinish} requiredMark={false} size="large">
          <Form.Item
            label="Số điện thoại"
            name="phone"
            rules={[
              { required: true, message: "Nhập số điện thoại" },
              { pattern: /^0\d{9}$/, message: "SĐT không hợp lệ (10 số)" },
            ]}
          >
            <Input
              prefix={<PhoneOutlined className="text-slate-400" />}
              placeholder="0901234567"
              autoFocus
              inputMode="tel"
              maxLength={10}
            />
          </Form.Item>

          <Form.Item
            label="Mật khẩu"
            name="pin"
            rules={[
              { required: true, message: "Nhập mật khẩu" },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined className="text-slate-400" />}
              placeholder="••••••"
            />
          </Form.Item>

          {err && (
            <Alert
              type="error"
              title={err}
              className="!mb-4"
              showIcon
            />
          )}

          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            block
            size="large"
            className="!h-12 !text-base !font-semibold"
          >
            Đăng nhập
          </Button>
        </Form>

        <div className="mt-6 pt-4 border-t border-slate-100">
          <Typography.Text type="secondary" className="text-xs block text-center mb-2">
            Tài khoản demo
          </Typography.Text>
          <div className="grid grid-cols-2 gap-2 text-xs text-center">
            <div className="bg-slate-50 rounded-lg p-2">
              <div className="font-medium text-slate-700">Admin</div>
              <code className="text-blue-600">0900000000</code>
            </div>
            <div className="bg-slate-50 rounded-lg p-2">
              <div className="font-medium text-slate-700">Tài xế</div>
              <code className="text-blue-600">0900000002</code>
            </div>
          </div>
          <div className="text-center text-xs text-slate-400 mt-2">
            Mật khẩu: <code className="text-slate-600">123456</code>
          </div>
        </div>
      </Card>
    </div>
  );
}
