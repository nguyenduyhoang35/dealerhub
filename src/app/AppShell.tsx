"use client";
import { Layout, Typography, Avatar, Dropdown, Space } from "antd";
import { useRouter, usePathname } from "next/navigation";
import { UserOutlined, LogoutOutlined, DownOutlined } from "@ant-design/icons";
import { MobileTopBar, DesktopSider } from "./NavBar";

const PAGE_TITLES: Record<string, string> = {
  "/": "Dashboard",
  "/agents": "Đại lý",
  "/products": "Sản phẩm",
  "/orders": "Đơn hàng",
  "/routes": "Lên tuyến",
  "/drivers": "Tài xế",
  "/my-route": "Tuyến của tôi",
};

export default function AppShell({
  role,
  name,
  children,
}: {
  role: string;
  name: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const title = PAGE_TITLES[pathname] || "DealerHub";

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  return (
    <div className="flex flex-col min-h-screen" style={{ background: "#f5f6fa" }}>
      <MobileTopBar role={role} title={title} onLogout={logout} />

      <Layout
        hasSider
        style={{ flex: 1, background: "#f5f6fa", minWidth: 0 }}
      >
        <DesktopSider role={role} />

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
                  <span className="text-xs text-slate-500">
                    {role === "admin" ? "Quản lý" : "Tài xế"}
                  </span>
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
