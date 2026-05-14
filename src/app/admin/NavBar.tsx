"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useMemo } from "react";
import { Layout, Menu, Button, Drawer, Typography, Tooltip } from "antd";
import {
  DashboardOutlined,
  ShopOutlined,
  AppstoreOutlined,
  FileTextOutlined,
  CarOutlined,
  TeamOutlined,
  LogoutOutlined,
  EnvironmentOutlined,
  MenuOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  FolderOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";

type NavItem = {
  key: string;
  icon: React.ReactNode;
  label: React.ReactNode;
  permission?: string;
};

const ALL_NAV_ITEMS: NavItem[] = [
  { key: "/admin", icon: <DashboardOutlined />, label: <Link href="/admin">Dashboard</Link>, permission: "dashboard.view" },
  { key: "/admin/agents", icon: <ShopOutlined />, label: <Link href="/admin/agents">Đại lý</Link>, permission: "agents.view" },
  { key: "/admin/categories", icon: <FolderOutlined />, label: <Link href="/admin/categories">Danh mục</Link>, permission: "categories.view" },
  { key: "/admin/products", icon: <AppstoreOutlined />, label: <Link href="/admin/products">Sản phẩm</Link>, permission: "products.view" },
  { key: "/admin/orders", icon: <FileTextOutlined />, label: <Link href="/admin/orders">Đơn hàng</Link>, permission: "orders.view" },
  { key: "/admin/routes", icon: <EnvironmentOutlined />, label: <Link href="/admin/routes">Lên tuyến</Link>, permission: "routes.view" },
  { key: "/admin/users", icon: <TeamOutlined />, label: <Link href="/admin/users">Người dùng</Link>, permission: "users.view" },
  { key: "/admin/roles", icon: <SafetyCertificateOutlined />, label: <Link href="/admin/roles">Vai trò</Link>, permission: "roles.view" },
];

const DRIVER_NAV_ITEMS: NavItem[] = [
  { key: "/my-route", icon: <CarOutlined />, label: <Link href="/my-route">Tuyến của tôi</Link> },
];

function useNavItems(role: string, permissions: string[]) {
  return useMemo(() => {
    if (role === "driver") {
      return DRIVER_NAV_ITEMS;
    }

    if (role === "superadmin") {
      return ALL_NAV_ITEMS;
    }

    return ALL_NAV_ITEMS.filter(item => {
      if (!item.permission) return true;
      return permissions.includes(item.permission);
    });
  }, [role, permissions]);
}

function SidebarContent({
  role,
  permissions,
  mini,
  onItemClick,
}: {
  role: string;
  permissions: string[];
  mini: boolean;
  onItemClick?: () => void;
}) {
  const pathname = usePathname();
  const items = useNavItems(role, permissions);
  return (
    <div className="flex flex-col h-full">
      <div
        className="flex items-center px-4 text-white"
        style={{ height: 64, borderBottom: "1px solid #334155" }}
      >
        <span style={{ fontSize: 22 }}>📦</span>
        {!mini && (
          <span className="ml-2 font-bold text-lg whitespace-nowrap">DealerHub</span>
        )}
      </div>

      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[pathname]}
        items={items}
        inlineCollapsed={mini}
        className="!bg-transparent !border-0 flex-1 !pt-2"
        onClick={onItemClick}
      />
    </div>
  );
}

export function MobileTopBar({
  role,
  permissions,
  title,
  onLogout,
}: {
  role: string;
  permissions: string[];
  title?: string;
  onLogout: () => void;
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      <header
        className="md:hidden flex items-center justify-between gap-2 px-3 bg-slate-800 text-white sticky top-0 z-50 w-full"
        style={{ height: 56, boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}
      >
        <Button
          type="text"
          icon={<MenuOutlined style={{ color: "#fff", fontSize: 18 }} />}
          onClick={() => setDrawerOpen(true)}
        />
        <Typography.Text
          className="!text-white !font-bold !flex-1 !text-center truncate"
          ellipsis
        >
          {title || "📦 DealerHub"}
        </Typography.Text>
        <Button
          type="text"
          icon={<LogoutOutlined style={{ color: "#fff" }} />}
          onClick={onLogout}
        />
      </header>

      <Drawer
        placement="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        closable={false}
        size={240}
        styles={{ body: { padding: 0, background: "#1e293b" } }}
        className="md:hidden"
      >
        <SidebarContent role={role} permissions={permissions} mini={false} onItemClick={() => setDrawerOpen(false)} />
      </Drawer>
    </>
  );
}

export function DesktopSider({ role, permissions }: { role: string; permissions: string[] }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Layout.Sider
      width={220}
      collapsedWidth={72}
      collapsed={collapsed}
      collapsible
      trigger={null}
      theme="dark"
      className="!hidden md:!block"
      style={{
        background: "#1e293b",
        position: "sticky",
        top: 0,
        height: "100vh",
        boxShadow: "2px 0 8px rgba(0,0,0,0.08)",
        zIndex: 50,
        flex: "none",
      }}
    >
      <div className="relative h-full">
        <SidebarContent role={role} permissions={permissions} mini={collapsed} />
        <Tooltip title={collapsed ? "Mở rộng" : "Thu gọn"} placement="right">
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? "Mở rộng" : "Thu gọn"}
            className="absolute flex items-center justify-center cursor-pointer transition-colors"
            style={{
              top: 18,
              right: -14,
              background: "#fff",
              color: "#475569",
              border: "1px solid #e2e8f0",
              borderRadius: "50%",
              width: 28,
              height: 28,
              zIndex: 100,
              boxShadow: "0 2px 8px rgba(15, 23, 42, 0.12)",
            }}
          >
            {collapsed ? (
              <MenuUnfoldOutlined style={{ fontSize: 12 }} />
            ) : (
              <MenuFoldOutlined style={{ fontSize: 12 }} />
            )}
          </button>
        </Tooltip>
      </div>
    </Layout.Sider>
  );
}
