import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminLayout } from "@/components/AdminLayout";

export default async function Layout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session || !["ADMIN", "SUPERADMIN"].includes(session.user?.role as string)) {
    redirect("/login");
  }

  return <AdminLayout>{children}</AdminLayout>;
}
