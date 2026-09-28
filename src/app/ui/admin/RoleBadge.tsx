"use client";

import { useContext } from "react";
import { AuthContext } from "@/app/ui/admin/AuthContext";
import { Badge, Text, rem } from "@mantine/core";

export default function RoleBadge() {
  const sessionContext = useContext(AuthContext);

  return (
    <Badge
      h={14}
      maw={75}
      px={5}
      ml={7}
      radius={"sm"}
      color={sessionContext.user.role === "admin" ? "red" : "blue"}
    >
      <Text size={rem(9)} fw={700} truncate={"end"}>
        {sessionContext.user.role}
      </Text>
    </Badge>
  );
}
