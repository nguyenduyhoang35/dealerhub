"use client";
import { useEffect, useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Switch,
  Tag,
  Space,
  Typography,
  Popconfirm,
  Card,
  App,
} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";

type Driver = {
  id: number;
  name: string;
  phone: string;
  vehicle_plate: string | null;
  role: "admin" | "driver";
  active: number;
};

export default function DriversPage() {
  const { message } = App.useApp();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Driver | null>(null);
  const [form] = Form.useForm();

  const load = async () => {
    setLoading(true);
    const r = await fetch("/api/drivers");
    setDrivers(await r.json());
    setLoading(false);
  };
  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ role: "driver", active: true });
    setOpen(true);
  };
  const openEdit = (d: Driver) => {
    setEditing(d);
    form.setFieldsValue({ ...d, pin: "", active: !!d.active });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    const url = editing ? `/api/drivers/${editing.id}` : "/api/drivers";
    const r = await fetch(url, {
      method: editing ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    if (!r.ok) {
      const e = await r.json();
      message.error(e.error || "Lỗi lưu");
      return;
    }
    message.success(editing ? "Đã cập nhật" : "Đã thêm tài khoản");
    setOpen(false);
    load();
  };

  const del = async (id: number) => {
    const r = await fetch(`/api/drivers/${id}`, { method: "DELETE" });
    if (!r.ok) {
      const e = await r.json();
      message.error(e.error || "Lỗi xóa");
      return;
    }
    message.success("Đã xóa");
    load();
  };

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <Typography.Title level={3} className="!m-0">Tài xế & Tài khoản</Typography.Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
          Thêm tài khoản
        </Button>
      </div>

      <Card styles={{ body: { padding: 0 } }}>
        <Table
          dataSource={drivers}
          loading={loading}
          rowKey="id"
          pagination={false}
          columns={[
            { title: "Tên", dataIndex: "name", width: 200, ellipsis: true, render: (v) => <b>{v}</b> },
            { title: "SĐT", dataIndex: "phone", width: 140 },
            { title: "Biển số", dataIndex: "vehicle_plate", width: 140, render: (v) => v || "—" },
            {
              title: "Vai trò",
              dataIndex: "role",
              width: 110,
              render: (r) =>
                r === "admin" ? (
                  <Tag color="purple">Quản lý</Tag>
                ) : (
                  <Tag color="cyan">Tài xế</Tag>
                ),
            },
            {
              title: "Trạng thái",
              dataIndex: "active",
              width: 120,
              render: (v) =>
                v ? <Tag color="success">Hoạt động</Tag> : <Tag>Tắt</Tag>,
            },
            {
              title: "",
              width: 160,
              align: "center",
              render: (_, r) => (
                <Space size={4}>
                  <Button type="link" size="small" icon={<EditOutlined />} onClick={() => openEdit(r)}>
                    Sửa
                  </Button>
                  <Popconfirm
                    title="Xóa tài khoản?"
                    onConfirm={() => del(r.id)}
                    okText="Xóa"
                    cancelText="Hủy"
                    okButtonProps={{ danger: true }}
                  >
                    <Button type="link" size="small" danger icon={<DeleteOutlined />}>
                      Xóa
                    </Button>
                  </Popconfirm>
                </Space>
              ),
            },
          ]}
        />
      </Card>

      <Modal
        title={editing ? `Sửa: ${editing.name}` : "Thêm tài khoản"}
        open={open}
        onCancel={() => setOpen(false)}
        onOk={submit}
        okText={editing ? "Cập nhật" : "Thêm"}
        cancelText="Hủy"
        destroyOnHidden
      >
        <Form form={form} layout="vertical" requiredMark={false}>
          <Form.Item label="Tên" name="name" rules={[{ required: true }]}>
            <Input placeholder="Anh Tài" />
          </Form.Item>
          <Form.Item label="Số điện thoại" name="phone" rules={[{ required: true }]}>
            <Input placeholder="0901..." />
          </Form.Item>
          <Form.Item
            label={`Mã PIN ${editing ? "(để trống nếu không đổi)" : ""}`}
            name="pin"
            rules={editing ? [] : [{ required: true, message: "Nhập PIN" }]}
          >
            <Input.Password placeholder="4 số" />
          </Form.Item>
          <Form.Item label="Biển số xe" name="vehicle_plate">
            <Input placeholder="51A-12345" />
          </Form.Item>
          <Form.Item label="Vai trò" name="role">
            <Select
              options={[
                { value: "driver", label: "Tài xế" },
                { value: "admin", label: "Quản lý" },
              ]}
            />
          </Form.Item>
          <Form.Item label="Hoạt động" name="active" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
