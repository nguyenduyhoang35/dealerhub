"use client";
import { useState } from "react";
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
import {
  useUsers,
  useRoles,
  useAgents,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
} from "@/hooks";

const { useBreakpoint } = Grid;

type LocalUser = {
  id: number;
  name: string;
  phone: string;
  vehicle_plate: string | null;
  role_id: number | null;
  role?: string;
  roles?: { id: number; name: string; display_name: string };
  agent_id: number | null;
  agents?: { id: number; name: string };
  active: number | boolean;
};

const ROLE_COLORS: Record<string, string> = {
  superadmin: "red",
  admin: "purple",
  driver: "cyan",
  customer: "green",
};

export default function UsersPage() {
  const { message } = App.useApp();
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const { data: users = [], isLoading } = useUsers();
  const { data: roles = [] } = useRoles();
  const { data: agents = [] } = useAgents();
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<LocalUser | null>(null);
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
  const [form] = Form.useForm();

  const isCustomerRole = (roleId: number | null): boolean => {
    if (!roleId) return false;
    const role = roles.find((r) => r.id === roleId);
    return role?.name === "customer";
  };

  const getRoleName = (user: LocalUser): string => {
    if (user.roles) return user.roles.name;
    if (user.role) return user.role;
    const role = roles.find((r) => r.id === user.role_id);
    return role?.name || "customer";
  };

  const getRoleDisplayName = (user: LocalUser): string => {
    if (user.roles) return user.roles.display_name;
    const role = roles.find((r) => r.id === user.role_id);
    if (role) return role.display_name;
    const fallback: Record<string, string> = {
      superadmin: "Super Admin",
      admin: "Quản lý",
      driver: "Tài xế",
      customer: "Khách hàng",
    };
    return fallback[user.role || "customer"] || "Khách hàng";
  };

  const getAgentName = (user: LocalUser): string | null => {
    if (user.agents) return user.agents.name;
    if (user.agent_id) {
      const agent = agents.find((a) => a.id === user.agent_id);
      return agent?.name || null;
    }
    return null;
  };

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    const driverRole = roles.find((r) => r.name === "driver");
    setSelectedRoleId(driverRole?.id || null);
    form.setFieldsValue({ role_id: driverRole?.id, active: true });
    setOpen(true);
  };

  const openEdit = (u: LocalUser) => {
    setEditing(u);
    setSelectedRoleId(u.role_id);
    form.setFieldsValue({ ...u, pin: "", active: !!u.active });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    try {
      if (editing) {
        await updateUser.mutateAsync({ id: editing.id, ...values });
        message.success("Đã cập nhật");
      } else {
        await createUser.mutateAsync(values);
        message.success("Đã thêm tài khoản");
      }
      setOpen(false);
    } catch (err: any) {
      message.error(err.message || "Lỗi lưu");
    }
  };

  const del = async (id: number) => {
    try {
      await deleteUser.mutateAsync(id);
      message.success("Đã xóa");
    } catch (err: any) {
      message.error(err.message || "Lỗi xóa");
    }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <Typography.Title level={3} className="!m-0 hidden sm:block">
          Người dùng
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
          {isLoading ? (
            <div className="flex justify-center py-10">
              <Spin />
            </div>
          ) : (users as LocalUser[]).length === 0 ? (
            <Card>
              <Empty description="Chưa có tài khoản" />
            </Card>
          ) : (
            (users as LocalUser[]).map((u) => {
              const roleName = getRoleName(u);
              const roleDisplay = getRoleDisplayName(u);
              return (
                <Card
                  key={u.id}
                  styles={{ body: { padding: 12 } }}
                  onClick={() => openEdit(u)}
                  hoverable
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold truncate">{u.name}</span>
                        <Tag color={ROLE_COLORS[roleName] || "default"} className="!m-0">
                          {roleDisplay}
                        </Tag>
                        {!u.active && <Tag className="!m-0">Tắt</Tag>}
                      </div>
                      {u.phone && (
                        <a
                          href={`tel:${u.phone}`}
                          onClick={(e) => e.stopPropagation()}
                          className="text-xs text-blue-600 inline-flex items-center gap-1 mt-0.5"
                        >
                          <PhoneOutlined /> {u.phone}
                        </a>
                      )}
                      {u.vehicle_plate && (
                        <div className="text-xs text-slate-500 mt-0.5">
                          <CarOutlined /> {u.vehicle_plate}
                        </div>
                      )}
                      {getAgentName(u) && (
                        <div className="text-xs text-slate-500 mt-0.5">
                          Đại lý: {getAgentName(u)}
                        </div>
                      )}
                    </div>
                    <Popconfirm
                      title="Xóa tài khoản?"
                      onConfirm={() => del(u.id)}
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
              );
            })
          )}
        </div>
      ) : (
        <Card styles={{ body: { padding: 0 } }}>
          <Table
            dataSource={users as LocalUser[]}
            loading={isLoading}
            rowKey="id"
            pagination={false}
            scroll={{ x: 880 }}
            columns={[
              { title: "ID", dataIndex: "id", width: 70 },
              { title: "Tên", dataIndex: "name", width: 150, ellipsis: true, render: (v) => <b>{v}</b> },
              { title: "SĐT", dataIndex: "phone", width: 130 },
              { title: "Biển số", dataIndex: "vehicle_plate", width: 120, render: (v) => v || "—" },
              {
                title: "Vai trò",
                width: 120,
                render: (_, u) => {
                  const roleName = getRoleName(u);
                  const roleDisplay = getRoleDisplayName(u);
                  return <Tag color={ROLE_COLORS[roleName] || "default"}>{roleDisplay}</Tag>;
                },
              },
              {
                title: "Đại lý",
                width: 150,
                render: (_, u) => {
                  const agentName = getAgentName(u);
                  return agentName || <span className="text-slate-400">—</span>;
                },
              },
              {
                title: "Trạng thái",
                dataIndex: "active",
                width: 100,
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
        title={editing ? "Sửa tài khoản" : "Thêm tài khoản"}
        open={open}
        onClose={() => setOpen(false)}
        onOk={submit}
        loading={createUser.isPending || updateUser.isPending}
      >
        <Form form={form} layout="vertical">
          <Form.Item label="Tên" name="name" rules={[{ required: true, message: "Nhập tên" }]}>
            <Input placeholder="Nguyễn Văn A" />
          </Form.Item>
          <Form.Item
            label="Số điện thoại"
            name="phone"
            rules={[{ required: true, message: "Nhập SĐT" }]}
          >
            <Input placeholder="0901234567" />
          </Form.Item>
          <Form.Item
            label={editing ? "Mật khẩu (để trống nếu không đổi)" : "Mật khẩu"}
            name="pin"
            rules={editing ? [] : [{ required: true, message: "Nhập mật khẩu" }]}
          >
            <Input.Password placeholder="••••••" />
          </Form.Item>
          <Form.Item label="Biển số xe" name="vehicle_plate">
            <Input placeholder="51A-12345" />
          </Form.Item>
          <Form.Item label="Vai trò" name="role_id" rules={[{ required: true, message: "Chọn vai trò" }]}>
            <Select
              placeholder="Chọn vai trò"
              options={roles.map((r) => ({
                value: r.id,
                label: r.display_name,
              }))}
              onChange={(v) => setSelectedRoleId(v)}
            />
          </Form.Item>
          {isCustomerRole(selectedRoleId) && (
            <Form.Item
              label="Đại lý"
              name="agent_id"
              rules={[{ required: true, message: "Chọn đại lý" }]}
            >
              <Select
                placeholder="Chọn đại lý"
                showSearch
                optionFilterProp="label"
                options={agents.map((a) => ({
                  value: a.id,
                  label: a.name,
                }))}
              />
            </Form.Item>
          )}
          <Form.Item label="Hoạt động" name="active" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </FormDrawer>
    </>
  );
}
