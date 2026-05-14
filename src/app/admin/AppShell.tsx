"use client";
import { Layout, Typography, Avatar, Dropdown, Space, Spin, Modal } from "antd";
import { useRouter, usePathname } from "next/navigation";
import { UserOutlined, LogoutOutlined, DownOutlined } from "@ant-design/icons";
import { MobileTopBar, DesktopSider } from "./NavBar";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import QueryProvider from "@/components/QueryProvider";

const PAGE_TITLES: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/agents": "Đại lý",
  "/admin/categories": "Danh mục",
  "/admin/products": "Sản phẩm",
  "/admin/orders": "Đơn hàng",
  "/admin/routes": "Lên tuyến",
  "/admin/users": "Người dùng",
  "/admin/roles": "Vai trò & Quyền",
  "/my-route": "Tuyến của tôi",
};

function AppShellContent({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const title = PAGE_TITLES[pathname] || "DealerHub";

  const logout = () => {
    Modal.confirm({
      title: "Đăng xuất?",
      content: "Bạn có chắc muốn đăng xuất khỏi hệ thống?",
      okText: "Đăng xuất",
      cancelText: "Hủy",
      okButtonProps: { danger: true },
      onOk: async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        router.push("/login");
        router.refresh();
      },
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: "#f5f6fa" }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!user) {
    router.push("/login");
    return null;
  }

  const role = user.role;
  const name = user.name;
  const permissions = user.permissions;
  const roleDisplay = user.role_display;

  return (
    <div className="flex flex-col min-h-screen" style={{ background: "#f5f6fa" }}>
      <MobileTopBar role={role} permissions={permissions} title={title} onLogout={logout} />

      <Layout
        hasSider
        style={{ flex: 1, background: "#f5f6fa", minWidth: 0 }}
      >
        <DesktopSider role={role} permissions={permissions} />

        <Layout style={{ background: "#f5f6fa", minWidth: 0 }}>
          <Layout.Header
            className="hidden md:flex items-center justify-between"
            style={{
              background: "#fff",
              padding: "0 24px",
              height: 64,
              lineHeight: "64px",
              borderBottom: "1px solid #e5e7eb",
              position: "sticky",
              top: 0,
              zIndex: 10,
            }}
          >
            <Typography.Title level={4} style={{ margin: 0 }}>
              {title}
            </Typography.Title>

            <Dropdown
              menu={{
                items: [
                  {
                    key: "logout",
                    icon: <LogoutOutlined />,
                    label: "Đăng xuất",
                    danger: true,
                    onClick: logout,
                  },
                ],
              }}
              placement="bottomRight"
            >
              <Space className="cursor-pointer">
                <Avatar style={{ background: "#2563eb" }} icon={<UserOutlined />} />
                <div className="flex flex-col items-start leading-tight">
                  <span className="font-semibold">{name}</span>
                  <span className="text-xs text-slate-500">{roleDisplay}</span>
                </div>
                <DownOutlined style={{ fontSize: 10, color: "#9ca3af" }} />
              </Space>
            </Dropdown>
          </Layout.Header>

          <Layout.Content
            className="px-3 sm:px-6 lg:px-8 py-4 sm:py-5"
            style={{ minWidth: 0, overflow: "auto" }}
          >
            {children}
          </Layout.Content>
        </Layout>
      </Layout>
    </div>
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <AuthProvider>
        <AppShellContent>{children}</AppShellContent>
      </AuthProvider>
    </QueryProvider>
  );
}
