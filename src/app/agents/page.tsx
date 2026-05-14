"use client";
import { useEffect, useState } from "react";
import {
  Table,
  Button,
  Form,
  Input,
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
  DownloadOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";
import FormDrawer from "../FormDrawer";

const { useBreakpoint } = Grid;

type Agent = {
  id: number;
  name: string;
  phone: string | null;
  address: string | null;
  note: string | null;
};

export default function AgentsPage() {
  const { message } = App.useApp();
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Agent | null>(null);
  const [form] = Form.useForm();

  const load = async () => {
    setLoading(true);
    const r = await fetch("/api/agents");
    setAgents(await r.json());
    setLoading(false);
  };
  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    setOpen(true);
  };
  const openEdit = (a: Agent) => {
    setEditing(a);
    form.setFieldsValue(a);
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    const url = editing ? `/api/agents/${editing.id}` : "/api/agents";
    const method = editing ? "PUT" : "POST";
    const r = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    if (!r.ok) {
      const e = await r.json();
      message.error(e.error || "Lỗi lưu");
      return;
    }
    message.success(editing ? "Đã cập nhật" : "Đã thêm đại lý");
    setOpen(false);
    load();
  };

  const del = async (id: number) => {
    await fetch(`/api/agents/${id}`, { method: "DELETE" });
    message.success("Đã xóa");
    load();
  };

  return (
    <>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <Typography.Title level={3} className="!m-0 hidden sm:block">
          Đại lý
        </Typography.Title>
        <Space wrap className="!ml-auto">
          <Button icon={<DownloadOutlined />} href="/api/export/agents">
            <span className="hidden sm:inline">Xuất công nợ</span>
            <span className="sm:hidden">Xuất</span>
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            <span className="hidden sm:inline">Thêm đại lý</span>
            <span className="sm:hidden">Thêm</span>
          </Button>
        </Space>
      </div>

      {isMobile ? (
        <div className="flex flex-col gap-2">
          {loading ? (
            <div className="flex justify-center py-10">
              <Spin />
            </div>
          ) : agents.length === 0 ? (
            <Card>
              <Empty description="Chưa có đại lý" />
            </Card>
          ) : (
            agents.map((a) => (
              <Card
                key={a.id}
                styles={{ body: { padding: 12 } }}
                onClick={() => openEdit(a)}
                hoverable
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold truncate">{a.name}</div>
                    {a.phone && (
                      <a
                        href={`tel:${a.phone}`}
                        onClick={(e) => e.stopPropagation()}
                        className="text-xs text-blue-600 inline-flex items-center gap-1 mt-0.5"
                      >
                        <PhoneOutlined /> {a.phone}
                      </a>
                    )}
                    {a.address && (
                      <div className="text-xs text-slate-500 truncate mt-0.5">
                        <EnvironmentOutlined /> {a.address}
                      </div>
                    )}
                    {a.note && (
                      <div className="text-xs text-slate-400 truncate mt-0.5">
                        {a.note}
                      </div>
                    )}
                  </div>
                  <Popconfirm
                    title="Xóa đại lý này?"
                    description="Các đơn liên quan sẽ bị xóa theo"
                    onConfirm={() => del(a.id)}
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
            dataSource={agents}
            loading={loading}
            rowKey="id"
            pagination={{ pageSize: 20 }}
            scroll={{ x: 720 }}
            columns={[
              { title: "Tên", dataIndex: "name", width: 240, ellipsis: true, render: (v) => <b>{v}</b> },
              { title: "SĐT", dataIndex: "phone", width: 140, render: (v) => v || "—" },
              { title: "Địa chỉ", dataIndex: "address", ellipsis: true, render: (v) => v || "—", responsive: ["md"] },
              { title: "Ghi chú", dataIndex: "note", ellipsis: true, render: (v) => <span className="text-slate-500">{v || "—"}</span>, responsive: ["lg"] },
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
                      title="Xóa đại lý này?"
                      description="Các đơn liên quan sẽ bị xóa theo"
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
        title={editing ? `Sửa: ${editing.name}` : "Thêm đại lý"}
        open={open}
        onClose={() => setOpen(false)}
        onOk={submit}
        okText={editing ? "Cập nhật" : "Thêm"}
      >
        <Form form={form} layout="vertical" requiredMark={false}>
          <Form.Item
            label="Tên"
            name="name"
            rules={[{ required: true, message: "Nhập tên" }]}
          >
            <Input placeholder="Đại lý ABC" />
          </Form.Item>
          <Form.Item label="Số điện thoại" name="phone">
            <Input placeholder="0901..." />
          </Form.Item>
          <Form.Item label="Địa chỉ" name="address">
            <Input placeholder="Số nhà, đường, phường, ..." />
          </Form.Item>
          <Form.Item label="Ghi chú" name="note">
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </FormDrawer>
    </>
  );
}
