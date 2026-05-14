import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import AppShell from "./AppShell";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await currentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "admin" && user.role !== "superadmin") {
    if (user.role === "driver") {
      redirect("/my-route");
    } else {
      redirect("/products");
    }
  }

  return <AppShell>{children}</AppShell>;
}
