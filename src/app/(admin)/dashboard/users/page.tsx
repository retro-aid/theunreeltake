"use client";

import { Box, Button, Title, Group } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { InviteUserModal } from "@/app/ui/admin/InviteUserModal";
import { UserTable } from "@/app/ui/admin/UserTable";
import { redirect } from "next/navigation";
import { useContext } from "react";
import { AuthContext } from "@/app/ui/admin/AuthContext";

/**
 * Creates the UI component for the Users page. Redirects back to dashboard if the user isn't an admin
 * @returns renders the page
 */
export default function DashboardUsersPage() {
  const authContext = useContext(AuthContext);
  if (authContext.user.role != "admin") redirect("/dashboard");

  const [opened, { open, close }] = useDisclosure(false);
  return (
    <Box>
      <Group justify="space-between" mb="md">
        <Title order={2} mb="md">
          Users
        </Title>
        <Button color="dark" radius="md" onClick={open}>
          Invite a New User
        </Button>
      </Group>
      <UserTable />
      <InviteUserModal opened={opened} onCloseAction={close} />
    </Box>
  );
}
