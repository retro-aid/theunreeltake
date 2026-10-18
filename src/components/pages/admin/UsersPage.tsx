import { Box, Title } from "@mantine/core";
import { UserTable } from "@/app/ui/admin/UserTable";
import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/dal/utils";

/**
 * Creates the UI component for the Users page. Redirects back to dashboard if the user isn't an admin
 * @returns renders the page
 */
export async function UsersPage() {
  const session = await getCurrentSession();
  if (session.user.role != "admin") redirect("/dashboard");

  return (
    <Box>
      <Title mb="xs">Users</Title>
      <UserTable />
    </Box>
  );
}
