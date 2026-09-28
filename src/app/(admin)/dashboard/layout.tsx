import React from "react";
import { AdminShell } from "@/app/ui/admin/AdminShell";
import { AuthContextProvider } from "@/app/ui/admin/AuthContext";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function AdminDashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) redirect("/login");

  return (
    <AuthContextProvider session={session}>
      <AdminShell>{children}</AdminShell>
    </AuthContextProvider>
  );
}
