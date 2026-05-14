import "./globals.css";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { currentUser } from "@/lib/auth";
import AntdProvider from "./AntdProvider";
import AppShell from "./AppShell";

export const metadata = {
  title: "DealerHub - Quản lý giao hàng đại lý",
  description: "Quản lý giao hàng sỉ cho các đại lý",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await currentUser();

  return (
    <html lang="vi">
      <body>
        <AntdRegistry>
          <AntdProvider>
            {user ? (
              <AppShell role={user.role} name={user.name}>
                {children}
              </AppShell>
            ) : (
              <main>{children}</main>
            )}
          </AntdProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}
