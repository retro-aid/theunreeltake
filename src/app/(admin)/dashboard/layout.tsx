import React from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { AuthContextProvider } from "@/components/admin/AuthContext";
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
