"use client";
import { useState } from "react";
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
  Grid,
  Spin,
  Tag,
} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import FormDrawer from "../FormDrawer";
import CommonInputNumber from "@/components/CommonInputNumber";
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
  type Category,
} from "@/hooks";

const { useBreakpoint } = Grid;

type CategoryWithSort = Category & { sort_order: number };

export default function CategoriesPage() {
  const { message } = App.useApp();
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const { data: categories = [], isLoading } = useCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<CategoryWithSort | null>(null);
  const [form] = Form.useForm();

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ sort_order: 0 });
    setOpen(true);
  };

  const openEdit = (c: CategoryWithSort) => {
    setEditing(c);
    form.setFieldsValue(c);
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    try {
      if (editing) {
        await updateCategory.mutateAsync({ id: editing.id, ...values });
        message.success("Đã cập nhật");
      } else {
        await createCategory.mutateAsync(values);
        message.success("Đã thêm danh mục");
      }
      setOpen(false);
    } catch (err: any) {
      message.error(err.message || "Lỗi lưu");
    }
  };

  const del = async (id: number) => {
    try {
      await deleteCategory.mutateAsync(id);
      message.success("Đã xóa");
    } catch (err: any) {
      message.error(err.message || "Lỗi xóa");
    }
  };

  const categoriesWithSort = categories as CategoryWithSort[];

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

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spin size="large" />
        </div>
      ) : isMobile ? (
        <div className="space-y-3">
          {categoriesWithSort.length === 0 ? (
            <Card className="text-center py-8 text-gray-500">
              Chưa có danh mục nào
            </Card>
          ) : (
            categoriesWithSort.map((c) => (
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
            dataSource={categoriesWithSort}
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
        loading={createCategory.isPending || updateCategory.isPending}
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
            <CommonInputNumber min={0} className="w-full" placeholder="0" />
          </Form.Item>
        </Form>
      </FormDrawer>
    </>
  );
}
