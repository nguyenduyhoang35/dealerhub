"use client";
import { useEffect, useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Space,
  Typography,
  Popconfirm,
  Card,
  App,
} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, DownloadOutlined } from "@ant-design/icons";
import { fmtVND, vndInputProps } from "@/lib/format";

type Product = {
  id: number;
  name: string;
  unit: string;
  price: number;
  stock: number;
};

export default function ProductsPage() {
  const { message } = App.useApp();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form] = Form.useForm();

  const load = async () => {
    setLoading(true);
    const r = await fetch("/api/products");
    setProducts(await r.json());
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
      <div className="flex items-center justify-between mb-4">
        <Typography.Title level={3} className="!m-0">Sản phẩm</Typography.Title>
        <Space>
          <Button icon={<DownloadOutlined />} href="/api/export/products">
            Xuất Excel
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            Thêm sản phẩm
          </Button>
        </Space>
      </div>

      <Card styles={{ body: { padding: 0 } }}>
        <Table
          dataSource={products}
          loading={loading}
          rowKey="id"
          pagination={{ pageSize: 20 }}
          columns={[
            {
              title: "Tên sản phẩm",
              dataIndex: "name",
              width: 280,
              ellipsis: true,
              render: (v) => <b>{v}</b>,
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
              width: 160,
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

      <Modal
        title={editing ? `Sửa: ${editing.name}` : "Thêm sản phẩm"}
        open={open}
        onCancel={() => setOpen(false)}
        onOk={submit}
        okText={editing ? "Cập nhật" : "Thêm"}
        cancelText="Hủy"
        destroyOnHidden
      >
        <Form form={form} layout="vertical" requiredMark={false}>
          <Form.Item label="Tên" name="name" rules={[{ required: true, message: "Nhập tên" }]}>
            <Input placeholder="Mì tôm Hảo Hảo" />
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
      </Modal>
    </>
  );
}
