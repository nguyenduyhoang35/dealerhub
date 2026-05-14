"use client";
import { useEffect, useState } from "react";
import {
  Table,
  Button,
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
  Empty,
  Grid,
  Spin,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  PhoneOutlined,
  CarOutlined,
} from "@ant-design/icons";
import FormDrawer from "../FormDrawer";

const { useBreakpoint } = Grid;

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
  const screens = useBreakpoint();
  const isMobile = !screens.md;
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
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <Typography.Title level={3} className="!m-0 hidden sm:block">
          Tài xế & Tài khoản
        </Typography.Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={openCreate}
          className="!ml-auto"
        >
          <span className="hidden sm:inline">Thêm tài khoản</span>
          <span className="sm:hidden">Thêm</span>
        </Button>
      </div>

      {isMobile ? (
        <div className="flex flex-col gap-2">
          {loading ? (
            <div className="flex justify-center py-10">
              <Spin />
            </div>
          ) : drivers.length === 0 ? (
            <Card>
              <Empty description="Chưa có tài khoản" />
            </Card>
          ) : (
            drivers.map((d) => (
              <Card
                key={d.id}
                styles={{ body: { padding: 12 } }}
                onClick={() => openEdit(d)}
                hoverable
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold truncate">{d.name}</span>
                      {d.role === "admin" ? (
                        <Tag color="purple" className="!m-0">Quản lý</Tag>
                      ) : (
                        <Tag color="cyan" className="!m-0">Tài xế</Tag>
                      )}
                      {!d.active && <Tag className="!m-0">Tắt</Tag>}
                    </div>
                    {d.phone && (
                      <a
                        href={`tel:${d.phone}`}
                        onClick={(e) => e.stopPropagation()}
                        className="text-xs text-blue-600 inline-flex items-center gap-1 mt-0.5"
                      >
                        <PhoneOutlined /> {d.phone}
                      </a>
                    )}
                    {d.vehicle_plate && (
                      <div className="text-xs text-slate-500 mt-0.5">
                        <CarOutlined /> {d.vehicle_plate}
                      </div>
                    )}
                  </div>
                  <Popconfirm
                    title="Xóa tài khoản?"
                    onConfirm={() => del(d.id)}
                    okText="Xóa"
                    cancelText="Hủy"
                    okButtonProps={{ danger: true }}
                  >
                    <Button
                      type="text"
                      size="small"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </Popconfirm>
                </div>
              </Card>
            ))
          )}
        </div>
      ) : (
      <Card styles={{ body: { padding: 0 } }}>
        <Table
          dataSource={drivers}
          loading={loading}
          rowKey="id"
          pagination={false}
          scroll={{ x: 880 }}
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
      )}

      <FormDrawer
        title={editing ? `Sửa: ${editing.name}` : "Thêm tài khoản"}
        open={open}
        onClose={() => setOpen(false)}
        onOk={submit}
        okText={editing ? "Cập nhật" : "Thêm"}
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
      </FormDrawer>
    </>
  );
}
