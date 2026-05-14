import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import DriverLayoutClient from "./DriverLayoutClient";

export default async function DriverLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await currentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "driver") {
    if (user.role === "superadmin" || user.role === "admin") {
      redirect("/admin");
    } else {
      redirect("/products");
    }
  }

  return (
    <DriverLayoutClient user={{ id: user.id, name: user.name, role: user.role }}>
      {children}
    </DriverLayoutClient>
  );
}
