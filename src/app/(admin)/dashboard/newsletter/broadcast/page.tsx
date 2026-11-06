"use client";

import { useContext } from "react";
import { redirect } from "next/navigation";
import { AuthContext } from "@/app/ui/admin/AuthContext";
import { BroadcastComposer } from "@/components/newsletter";

export default function BroadcastPage() {
  const authContext = useContext(AuthContext);
  if (authContext.user.role !== "admin") redirect("/dashboard");

  return <BroadcastComposer />;
}
