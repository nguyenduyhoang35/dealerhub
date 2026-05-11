"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
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
} from "@ant-design/icons";

export default function NavBar({ role, name }: { role: string; name: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  const adminItems = [
    { key: "/", icon: <DashboardOutlined />, label: <Link href="/">Dashboard</Link> },
    { key: "/agents", icon: <ShopOutlined />, label: <Link href="/agents">Đại lý</Link> },
    { key: "/products", icon: <AppstoreOutlined />, label: <Link href="/products">Sản phẩm</Link> },
    { key: "/orders", icon: <FileTextOutlined />, label: <Link href="/orders">Đơn hàng</Link> },
    { key: "/routes", icon: <EnvironmentOutlined />, label: <Link href="/routes">Lên tuyến</Link> },
    { key: "/drivers", icon: <TeamOutlined />, label: <Link href="/drivers">Tài xế</Link> },
  ];
  const driverItems = [
    { key: "/my-route", icon: <CarOutlined />, label: <Link href="/my-route">Tuyến của tôi</Link> },
  ];
  const items = role === "admin" ? adminItems : driverItems;

  const sidebarContent = (mini: boolean, onItemClick?: () => void) => (
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

  return (
    <>
      {/* MOBILE: topbar + drawer */}
      <header
        className="md:hidden flex items-center justify-between px-4 bg-slate-800 text-white sticky top-0 z-50"
        style={{ height: 56, boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}
      >
        <Button
          type="text"
          icon={<MenuOutlined style={{ color: "#fff", fontSize: 18 }} />}
          onClick={() => setDrawerOpen(true)}
        />
        <Typography.Text className="!text-white !font-bold">
          📦 DealerHub
        </Typography.Text>
        <Button
          type="text"
          icon={<LogoutOutlined style={{ color: "#fff" }} />}
          onClick={logout}
        />
      </header>

      <Drawer
        placement="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        closable={false}
        width={240}
        styles={{ body: { padding: 0, background: "#1e293b" } }}
        className="md:hidden"
      >
        {sidebarContent(false, () => setDrawerOpen(false))}
      </Drawer>

      {/* DESKTOP: sticky sidebar */}
      <Layout.Sider
        width={220}
        collapsedWidth={72}
        collapsed={collapsed}
        collapsible
        trigger={null}
        theme="dark"
        breakpoint="md"
        className="!hidden md:!block"
        style={{
          background: "#1e293b",
          position: "sticky",
          top: 0,
          height: "100vh",
          boxShadow: "2px 0 8px rgba(0,0,0,0.08)",
          zIndex: 50,
        }}
      >
        <div className="relative h-full">
          {sidebarContent(collapsed)}
          <Tooltip
            title={collapsed ? "Mở rộng" : "Thu gọn"}
            placement="right"
          >
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
    </>
  );
}
