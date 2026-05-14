"use client";
import { useEffect, useState } from "react";
import {
  Table,
  Button,
  Form,
  Input,
  InputNumber,
  Select,
  Space,
  Typography,
  Popconfirm,
  Card,
  App,
  Empty,
  Grid,
  Spin,
  Tag,
} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, DownloadOutlined } from "@ant-design/icons";
import { fmtVND, vndInputProps } from "@/lib/format";
import FormDrawer from "../FormDrawer";

const { useBreakpoint } = Grid;

type Category = {
  id: number;
  name: string;
};

type Product = {
  id: number;
  name: string;
  unit: string;
  price: number;
  stock: number;
  category_id: number | null;
  category: Category | null;
};

export default function ProductsPage() {
  const { message } = App.useApp();
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form] = Form.useForm();

  const load = async () => {
    setLoading(true);
    const [prodRes, catRes] = await Promise.all([
      fetch("/api/products"),
      fetch("/api/categories"),
    ]);
    const prodData = await prodRes.json();
    const catData = await catRes.json();
    setProducts(Array.isArray(prodData) ? prodData : []);
    setCategories(Array.isArray(catData) ? catData : []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ unit: "cái", price: 0, stock: 0 });
    setOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    form.setFieldsValue(p);
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    const url = editing ? `/api/products/${editing.id}` : "/api/products";
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
    message.success(editing ? "Đã cập nhật" : "Đã thêm sản phẩm");
    setOpen(false);
    load();
  };

  const del = async (id: number) => {
    await fetch(`/api/products/${id}`, { method: "DELETE" });
    message.success("Đã xóa");
    load();
  };

  return (
    <>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <Typography.Title level={3} className="!m-0 hidden sm:block">
          Sản phẩm
        </Typography.Title>
        <Space wrap className="!ml-auto">
          <Button icon={<DownloadOutlined />} href="/api/export/products">
            <span className="hidden sm:inline">Xuất Excel</span>
            <span className="sm:hidden">Xuất</span>
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            <span className="hidden sm:inline">Thêm sản phẩm</span>
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
          ) : products.length === 0 ? (
            <Card>
              <Empty description="Chưa có sản phẩm" />
            </Card>
          ) : (
            products.map((p) => (
              <Card
                key={p.id}
                styles={{ body: { padding: 12 } }}
                onClick={() => openEdit(p)}
                hoverable
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold truncate">{p.name}</div>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="font-bold text-blue-600">{fmtVND(p.price)}</span>
                      <Tag className="!m-0">{p.unit}</Tag>
                      <Tag
                        color={p.stock > 0 ? "green" : "red"}
                        className="!m-0"
                      >
                        Tồn: {p.stock}
                      </Tag>
                    </div>
                    {p.category && (
                      <Tag color="purple" className="!mt-1">
                        {p.category.name}
                      </Tag>
                    )}
                  </div>
                  <Popconfirm
                    title="Xóa sản phẩm?"
                    onConfirm={() => del(p.id)}
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
            dataSource={products}
            loading={loading}
            rowKey="id"
            pagination={{ pageSize: 20 }}
            scroll={{ x: 900 }}
            columns={[
              {
                title: "Tên sản phẩm",
                dataIndex: "name",
                width: 250,
                ellipsis: true,
                render: (v) => <b>{v}</b>,
              },
              {
                title: "Danh mục",
                dataIndex: "category",
                width: 150,
                render: (c: Category | null) =>
                  c ? <Tag color="purple">{c.name}</Tag> : <span className="text-gray-400">—</span>,
                filters: categories.map((c) => ({ text: c.name, value: c.id })),
                onFilter: (value, record) => record.category_id === value,
              },
              { title: "Đơn vị", dataIndex: "unit", width: 100 },
              {
                title: "Giá",
                dataIndex: "price",
                align: "right",
                width: 140,
                render: (v) => fmtVND(v),
                sorter: (a, b) => a.price - b.price,
              },
              {
                title: "Tồn kho",
                dataIndex: "stock",
                align: "right",
                width: 100,
                sorter: (a, b) => a.stock - b.stock,
              },
              {
                title: "",
                width: 140,
                align: "center",
                render: (_, r) => (
                  <Space size={4}>
                    <Button
                      type="link"
                      size="small"
                      icon={<EditOutlined />}
                      onClick={() => openEdit(r)}
                    >
                      Sửa
                    </Button>
                    <Popconfirm
                      title="Xóa sản phẩm?"
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
        title={editing ? `Sửa: ${editing.name}` : "Thêm sản phẩm"}
        open={open}
        onClose={() => setOpen(false)}
        onOk={submit}
        okText={editing ? "Cập nhật" : "Thêm"}
      >
        <Form form={form} layout="vertical" requiredMark={false}>
          <Form.Item label="Tên" name="name" rules={[{ required: true, message: "Nhập tên" }]}>
            <Input placeholder="Mì tôm Hảo Hảo" />
          </Form.Item>
          <Form.Item label="Danh mục" name="category_id">
            <Select
              placeholder="Chọn danh mục"
              allowClear
              options={categories.map((c) => ({ value: c.id, label: c.name }))}
            />
          </Form.Item>
          <Form.Item label="Đơn vị" name="unit">
            <Input placeholder="thùng, chai, kg..." />
          </Form.Item>
          <Form.Item label="Giá (VNĐ)" name="price">
            <InputNumber
              className="!w-full"
              min={0}
              step={1000}
              {...vndInputProps}
            />
          </Form.Item>
          <Form.Item label="Tồn kho" name="stock">
            <InputNumber className="!w-full" min={0} />
          </Form.Item>
        </Form>
      </FormDrawer>
    </>
  );
}
