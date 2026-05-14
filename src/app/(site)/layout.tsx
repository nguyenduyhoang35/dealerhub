"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Layout, Menu, Button, Avatar, Dropdown, Space, Drawer, Modal } from "antd";
import {
  HomeOutlined,
  ShoppingCartOutlined,
  FileTextOutlined,
  DollarOutlined,
  UserOutlined,
  LogoutOutlined,
  LoginOutlined,
  MenuOutlined,
} from "@ant-design/icons";
import QueryProvider from "@/components/QueryProvider";

type User = { id: number; name: string; role: string } | null;

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const isHome = pathname === "/";

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setUser(data?.user || null))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!isHome) {
      setScrolled(true);
      return;
    }
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isHome]);

  const menuItems = [
    {
      key: "/",
      icon: <HomeOutlined />,
      label: <Link href="/">Trang chủ</Link>,
    },
    {
      key: "/products",
      icon: <ShoppingCartOutlined />,
      label: <Link href="/products">Sản phẩm</Link>,
    },
    {
      key: "/orders",
      icon: <FileTextOutlined />,
      label: <Link href="/orders">Đơn hàng</Link>,
    },
    {
      key: "/debt",
      icon: <DollarOutlined />,
      label: <Link href="/debt">Công nợ</Link>,
    },
  ];

  const logout = () => {
    Modal.confirm({
      title: "Đăng xuất?",
      content: "Bạn có chắc muốn đăng xuất khỏi tài khoản?",
      okText: "Đăng xuất",
      cancelText: "Hủy",
      okButtonProps: { danger: true },
      onOk: async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        setUser(null);
      },
    });
  };

  return (
    <Layout className="min-h-screen">
      {/* Header */}
      <Layout.Header
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-3 sm:px-4 md:px-8"
        style={{
          height: 56,
          lineHeight: "56px",
          background: scrolled ? "#ffffff" : "transparent",
          borderBottom: scrolled ? "1px solid #e5e7eb" : "none",
          boxShadow: scrolled ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 16px",
        }}
      >
        {/* Left: Logo */}
        <Link
          href="/"
          className={`flex items-center gap-1.5 sm:gap-2 text-lg sm:text-xl font-bold transition-colors shrink-0 ${
            scrolled ? "text-blue-600" : "text-white"
          }`}
        >
          <span className="text-xl sm:text-2xl">📦</span>
          <span className="inline">DealerHub</span>
        </Link>

        {/* Center: Desktop Menu - ẩn trên mobile */}
        <div className="hidden lg:flex flex-1 justify-center">
          <Menu
            mode="horizontal"
            selectedKeys={[pathname]}
            items={menuItems}
            disabledOverflow
            className={`!border-0 ${
              scrolled
                ? ""
                : "[&_.ant-menu-item]:!text-white/80 [&_.ant-menu-item-selected]:!text-white [&_.ant-menu-item:hover]:!text-white"
            }`}
            style={{ background: scrolled ? "#ffffff" : "transparent" }}
          />
        </div>

        {/* Right: User actions */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {!loading && user && (
            <Dropdown
              menu={{
                items: [
                  ...(user.role === "admin"
                    ? [
                        {
                          key: "admin",
                          icon: <UserOutlined />,
                          label: <Link href="/admin">Quản trị</Link>,
                        },
                      ]
                    : []),
                  {
                    key: "logout",
                    icon: <LogoutOutlined />,
                    label: "Đăng xuất",
                    danger: true,
                    onClick: logout,
                  },
                ],
              }}
            >
              <Space className="cursor-pointer">
                <Avatar
                  size="small"
                  style={{
                    background: scrolled ? "#2563eb" : "rgba(255,255,255,0.2)",
                  }}
                  icon={<UserOutlined />}
                />
                <span
                  className={`hidden sm:inline font-medium text-sm ${scrolled ? "text-slate-700" : "text-white"}`}
                >
                  {user.name}
                </span>
              </Space>
            </Dropdown>
          )}
          {!loading && !user && (
            <Link href="/login">
              <Button
                type="primary"
                icon={<LoginOutlined />}
                className="!h-9 !px-5 !font-semibold !rounded-full !bg-gradient-to-r !from-blue-500 !to-blue-600 !border-0 hover:!from-blue-600 hover:!to-blue-700 !shadow-md hover:!shadow-lg !transition-all"
              >
                Đăng nhập
              </Button>
            </Link>
          )}

          {/* Mobile menu button */}
          <Button
            type="text"
            icon={<MenuOutlined />}
            className={`lg:hidden !px-2 ${scrolled ? "" : "!text-white"}`}
            onClick={() => setMobileMenuOpen(true)}
          />
        </div>
      </Layout.Header>

      {/* Mobile Menu Drawer */}
      <Drawer
        title={
          <Link
            href="/"
            className="flex items-center gap-2 text-lg font-bold text-blue-600"
          >
            📦 DealerHub
          </Link>
        }
        placement="right"
        onClose={() => setMobileMenuOpen(false)}
        open={mobileMenuOpen}
        styles={{ body: { padding: 16 }, header: { padding: "12px 16px" } }}
        className="lg:hidden"
      >
        <Menu
          mode="vertical"
          selectedKeys={[pathname]}
          items={menuItems}
          className="!border-0"
          onClick={() => setMobileMenuOpen(false)}
        />
        <div className="mt-4 pt-4 border-t">
          {user ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 px-3">
                <Avatar
                  size="small"
                  style={{ background: "#2563eb" }}
                  icon={<UserOutlined />}
                />
                <span className="font-medium">{user.name}</span>
              </div>
              {user.role === "admin" && (
                <Link href="/admin" onClick={() => setMobileMenuOpen(false)}>
                  <Button block>Quản trị</Button>
                </Link>
              )}
              <Button block danger onClick={logout}>
                Đăng xuất
              </Button>
            </div>
          ) : (
            <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
              <Button type="primary" block icon={<LoginOutlined />}>
                Đăng nhập
              </Button>
            </Link>
          )}
        </div>
      </Drawer>

      {/* Content */}
      <Layout.Content
        className={isHome ? "" : "px-3 sm:px-4 md:px-8 py-4 sm:py-6"}
        style={{
          background: isHome ? "transparent" : "#f5f7fa",
          minHeight: "calc(100vh - 48px)",
          paddingTop: isHome ? 0 : 72,
        }}
      >
        <QueryProvider>{children}</QueryProvider>
      </Layout.Content>

      {/* Footer - ẩn trên trang chủ */}
      {!isHome && (
        <Layout.Footer
          className="text-center text-gray-500 text-xs sm:text-sm py-3 sm:py-4"
          style={{ background: "#fff" }}
        >
          © 2026 DealerHub
        </Layout.Footer>
      )}

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-900 border-t border-slate-700">
        <div className="flex justify-around py-1.5">
          {menuItems.map((item) => (
            <Link
              key={item.key}
              href={item.key}
              className={`flex flex-col items-center px-3 ${
                pathname === item.key ? "text-blue-400" : "text-slate-400"
              }`}
            >
              <span className="text-base">{item.icon}</span>
              <span className="text-[9px] mt-0.5">
                {item.key === "/"
                  ? "Home"
                  : item.key === "/products"
                    ? "Sản phẩm"
                    : item.key === "/orders"
                      ? "Đơn hàng"
                      : "Công nợ"}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </Layout>
  );
}
