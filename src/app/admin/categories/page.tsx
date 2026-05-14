"use client";
import { useEffect, useState } from "react";
import {
  Table,
  Button,
  Form,
  Input,
  InputNumber,
  Space,
  Typography,
  Popconfirm,
  Card,
  App,
  Grid,
  Spin,
  Tag,
} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import FormDrawer from "../FormDrawer";

const { useBreakpoint } = Grid;

type Category = {
  id: number;
  name: string;
  sort_order: number;
};

export default function CategoriesPage() {
  const { message } = App.useApp();
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form] = Form.useForm();

  const load = async () => {
    setLoading(true);
    const r = await fetch("/api/categories");
    const data = await r.json();
    setCategories(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ sort_order: 0 });
    setOpen(true);
  };

  const openEdit = (c: Category) => {
    setEditing(c);
    form.setFieldsValue(c);
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    const url = editing ? `/api/categories/${editing.id}` : "/api/categories";
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
    message.success(editing ? "Đã cập nhật" : "Đã thêm danh mục");
    setOpen(false);
    load();
  };

  const del = async (id: number) => {
    const r = await fetch(`/api/categories/${id}`, { method: "DELETE" });
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
          Danh mục sản phẩm
        </Typography.Title>
        <Space wrap className="!ml-auto">
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            <span className="hidden sm:inline">Thêm danh mục</span>
            <span className="sm:hidden">Thêm</span>
          </Button>
        </Space>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Spin size="large" />
        </div>
      ) : isMobile ? (
        <div className="space-y-3">
          {categories.length === 0 ? (
            <Card className="text-center py-8 text-gray-500">
              Chưa có danh mục nào
            </Card>
          ) : (
            categories.map((c) => (
              <Card
                key={c.id}
                size="small"
                className="shadow-sm"
                actions={[
                  <Button
                    key="edit"
                    type="text"
                    icon={<EditOutlined />}
                    onClick={() => openEdit(c)}
                  >
                    Sửa
                  </Button>,
                  <Popconfirm
                    key="del"
                    title="Xóa danh mục này?"
                    onConfirm={() => del(c.id)}
                  >
                    <Button type="text" danger icon={<DeleteOutlined />}>
                      Xóa
                    </Button>
                  </Popconfirm>,
                ]}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-base">{c.name}</div>
                    <Tag color="blue" className="mt-1">
                      Thứ tự: {c.sort_order}
                    </Tag>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      ) : (
        <Card styles={{ body: { padding: 0 } }}>
          <Table
            dataSource={categories}
            rowKey="id"
            pagination={false}
            columns={[
              {
                title: "ID",
                dataIndex: "id",
                width: 80,
              },
              {
                title: "Tên danh mục",
                dataIndex: "name",
                render: (v) => <span className="font-medium">{v}</span>,
              },
              {
                title: "Thứ tự",
                dataIndex: "sort_order",
                width: 100,
                align: "center",
                render: (v) => <Tag color="blue">{v}</Tag>,
              },
              {
                title: "",
                width: 120,
                render: (_, r) => (
                  <Space>
                    <Button
                      size="small"
                      icon={<EditOutlined />}
                      onClick={() => openEdit(r)}
                    />
                    <Popconfirm title="Xóa danh mục này?" onConfirm={() => del(r.id)}>
                      <Button size="small" danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                  </Space>
                ),
              },
            ]}
          />
        </Card>
      )}

      <FormDrawer
        title={editing ? "Sửa danh mục" : "Thêm danh mục"}
        open={open}
        onClose={() => setOpen(false)}
        onOk={submit}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Tên danh mục"
            rules={[{ required: true, message: "Nhập tên danh mục" }]}
          >
            <Input placeholder="VD: Bánh kẹo" />
          </Form.Item>
          <Form.Item
            name="sort_order"
            label="Thứ tự hiển thị"
            tooltip="Số nhỏ hơn hiển thị trước"
          >
            <InputNumber min={0} className="w-full" placeholder="0" />
          </Form.Item>
        </Form>
      </FormDrawer>
    </>
  );
}
