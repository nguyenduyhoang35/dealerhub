"use client";
import { Avatar, Dropdown } from "antd";
import {
  UserOutlined,
  LogoutOutlined,
  CarOutlined,
} from "@ant-design/icons";

type User = { id: number; name: string; role: string };

export default function DriverLayoutClient({
  user,
  children,
}: {
  user: User;
  children: React.ReactNode;
}) {
  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-blue-600 text-white px-4 py-3 shadow-md">
        <div className="flex items-center justify-between max-w-3xl mx-auto">
          <div className="flex items-center gap-2">
            <CarOutlined className="text-xl" />
            <span className="font-bold text-lg">Tuyến giao hàng</span>
          </div>

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
            trigger={["click"]}
          >
            <div className="flex items-center gap-2 cursor-pointer bg-white/20 rounded-full px-3 py-1.5">
              <Avatar size="small" icon={<UserOutlined />} className="!bg-white/30" />
              <span className="text-sm font-medium">{user.name}</span>
            </div>
          </Dropdown>
        </div>
      </header>

      {/* Content */}
      <main className="px-3 py-4">{children}</main>

      {/* Footer */}
      <footer className="text-center text-slate-400 text-xs py-4">
        © 2026 DealerHub
      </footer>
    </div>
  );
}
