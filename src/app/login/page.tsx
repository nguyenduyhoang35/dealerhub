"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Form, Input, Button, Card, Typography, Alert, App } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";

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
    router.push(data.role === "admin" ? "/" : "/my-route");
    router.refresh();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-5">
      <Card className="w-full max-w-sm shadow-lg">
        <div className="text-center mb-6">
          <div className="text-5xl">📦</div>
          <Typography.Title level={3} className="!mt-2 !mb-1">
            DealerHub
          </Typography.Title>
          <div className="text-slate-400 text-xs mb-1">Quản lý giao hàng đại lý</div>
          <Typography.Text type="secondary">Đăng nhập để tiếp tục</Typography.Text>
        </div>

        <Form layout="vertical" onFinish={onFinish} requiredMark={false} size="large">
          <Form.Item
            label="Số điện thoại"
            name="phone"
            rules={[{ required: true, message: "Nhập số điện thoại" }]}
          >
            <Input prefix={<UserOutlined />} placeholder="0901... hoặc admin" autoFocus />
          </Form.Item>

          <Form.Item
            label="Mã PIN"
            name="pin"
            rules={[{ required: true, message: "Nhập mã PIN" }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="••••" inputMode="numeric" />
          </Form.Item>

          {err && <Alert type="error" message={err} className="mb-3" />}

          <Button type="primary" htmlType="submit" loading={loading} block size="large">
            Đăng nhập
          </Button>

          <div className="text-center text-xs text-slate-400 mt-4">
            Admin mặc định: <code>admin</code> / <code>1234</code>
          </div>
        </Form>
      </Card>
    </div>
  );
}
