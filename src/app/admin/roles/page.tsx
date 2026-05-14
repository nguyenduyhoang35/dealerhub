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
  Tag,
  Checkbox,
  Collapse,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  LockOutlined,
} from "@ant-design/icons";
import FormDrawer from "../FormDrawer";

const { useBreakpoint } = Grid;

type Role = {
  id: number;
  name: string;
  display_name: string;
  description: string | null;
  is_system: boolean;
  permissions?: string[];
};

type PermissionGroup = {
  module: string;
  moduleName: string;
  permissions: { id: number; code: string; name: string }[];
};

export default function RolesPage() {
  const { message } = App.useApp();
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissionGroups, setPermissionGroups] = useState<PermissionGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Role | null>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [form] = Form.useForm();

  const load = async () => {
    setLoading(true);
    const [rolesRes, permsRes] = await Promise.all([
      fetch("/api/roles"),
      fetch("/api/permissions"),
    ]);
    const rolesData = await rolesRes.json();
    const permsData = await permsRes.json();
    setRoles(Array.isArray(rolesData) ? rolesData : []);
    setPermissionGroups(Array.isArray(permsData) ? permsData : []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setSelectedPermissions([]);
    form.resetFields();
    setOpen(true);
  };

  const openEdit = async (role: Role) => {
    setEditing(role);
    form.setFieldsValue(role);

    // Fetch role permissions
    const res = await fetch(`/api/roles/${role.id}`);
    const data = await res.json();
    setSelectedPermissions(data.permissions || []);
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    const url = editing ? `/api/roles/${editing.id}` : "/api/roles";
    const method = editing ? "PUT" : "POST";

    const payload = {
      ...values,
      permissions: selectedPermissions,
    };

    const r = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!r.ok) {
      const e = await r.json();
      message.error(e.error || "Lỗi lưu");
      return;
    }

    message.success(editing ? "Đã cập nhật" : "Đã thêm vai trò");
    setOpen(false);
    load();
  };

  const del = async (id: number) => {
    const r = await fetch(`/api/roles/${id}`, { method: "DELETE" });
    if (!r.ok) {
      const e = await r.json();
      message.error(e.error || "Lỗi xóa");
      return;
    }
    message.success("Đã xóa");
    load();
  };

  const togglePermission = (code: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(code)
        ? prev.filter((p) => p !== code)
        : [...prev, code]
    );
  };

  const toggleModule = (module: PermissionGroup, checked: boolean) => {
    const codes = module.permissions.map((p) => p.code);
    setSelectedPermissions((prev) => {
      if (checked) {
        return [...new Set([...prev, ...codes])];
      } else {
        return prev.filter((p) => !codes.includes(p));
      }
    });
  };

  const isModuleChecked = (module: PermissionGroup) => {
    return module.permissions.every((p) => selectedPermissions.includes(p.code));
  };

  const isModuleIndeterminate = (module: PermissionGroup) => {
    const checked = module.permissions.filter((p) => selectedPermissions.includes(p.code)).length;
    return checked > 0 && checked < module.permissions.length;
  };

  return (
    <>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <Typography.Title level={3} className="!m-0 hidden sm:block">
          Vai trò & Quyền
        </Typography.Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={openCreate}
          className="!ml-auto"
        >
          <span className="hidden sm:inline">Thêm vai trò</span>
          <span className="sm:hidden">Thêm</span>
        </Button>
      </div>

      {isMobile ? (
        <div className="flex flex-col gap-2">
          {loading ? (
            <div className="flex justify-center py-10">
              <Spin />
            </div>
          ) : roles.length === 0 ? (
            <Card>
              <Empty description="Chưa có vai trò" />
            </Card>
          ) : (
            roles.map((r) => (
              <Card
                key={r.id}
                styles={{ body: { padding: 12 } }}
                onClick={() => openEdit(r)}
                hoverable
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold truncate">{r.display_name}</span>
                      {r.is_system && (
                        <Tag color="purple" className="!m-0">
                          <LockOutlined /> Hệ thống
                        </Tag>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">{r.name}</div>
                    {r.description && (
                      <div className="text-xs text-slate-400 mt-1">{r.description}</div>
                    )}
                  </div>
                  {!r.is_system && (
                    <Popconfirm
                      title="Xóa vai trò?"
                      onConfirm={() => del(r.id)}
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
                  )}
                </div>
              </Card>
            ))
          )}
        </div>
      ) : (
        <Card styles={{ body: { padding: 0 } }}>
          <Table
            dataSource={roles}
            loading={loading}
            rowKey="id"
            pagination={false}
            columns={[
              {
                title: "Tên hiển thị",
                dataIndex: "display_name",
                width: 200,
                render: (v, r) => (
                  <Space>
                    <b>{v}</b>
                    {r.is_system && (
                      <Tag color="purple">
                        <LockOutlined /> Hệ thống
                      </Tag>
                    )}
                  </Space>
                ),
              },
              { title: "Mã", dataIndex: "name", width: 150 },
              {
                title: "Mô tả",
                dataIndex: "description",
                render: (v) => v || <span className="text-slate-400">—</span>,
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
                    {!r.is_system && (
                      <Popconfirm
                        title="Xóa vai trò?"
                        onConfirm={() => del(r.id)}
                        okText="Xóa"
                        cancelText="Hủy"
                        okButtonProps={{ danger: true }}
                      >
                        <Button type="link" size="small" danger icon={<DeleteOutlined />}>
                          Xóa
                        </Button>
                      </Popconfirm>
                    )}
                  </Space>
                ),
              },
            ]}
          />
        </Card>
      )}

      <FormDrawer
        title={editing ? "Sửa vai trò" : "Thêm vai trò"}
        open={open}
        onClose={() => setOpen(false)}
        onOk={submit}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Mã vai trò"
            name="name"
            rules={[{ required: true, message: "Nhập mã vai trò" }]}
          >
            <Input
              placeholder="customer_vip"
              disabled={editing?.is_system}
            />
          </Form.Item>
          <Form.Item
            label="Tên hiển thị"
            name="display_name"
            rules={[{ required: true, message: "Nhập tên hiển thị" }]}
          >
            <Input placeholder="Khách VIP" />
          </Form.Item>
          <Form.Item label="Mô tả" name="description">
            <Input.TextArea rows={2} placeholder="Mô tả vai trò..." />
          </Form.Item>
        </Form>

        <Typography.Title level={5} className="!mt-4 !mb-2">
          Quyền hạn
        </Typography.Title>

        <Collapse
          defaultActiveKey={permissionGroups.map((g) => g.module)}
          size="small"
          items={permissionGroups.map((group) => ({
            key: group.module,
            label: (
              <Checkbox
                checked={isModuleChecked(group)}
                indeterminate={isModuleIndeterminate(group)}
                onChange={(e) => {
                  e.stopPropagation();
                  toggleModule(group, e.target.checked);
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <b>{group.moduleName}</b>
              </Checkbox>
            ),
            children: (
              <div className="flex flex-col gap-1 pl-6">
                {group.permissions.map((p) => (
                  <Checkbox
                    key={p.code}
                    checked={selectedPermissions.includes(p.code)}
                    onChange={() => togglePermission(p.code)}
                  >
                    {p.name}
                    <span className="text-xs text-slate-400 ml-2">({p.code})</span>
                  </Checkbox>
                ))}
              </div>
            ),
          }))}
        />
      </FormDrawer>
    </>
  );
}
