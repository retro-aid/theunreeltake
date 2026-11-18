import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  Title,
  Text,
  Divider,
  Container,
  Fieldset,
  DataList,
  DataListItemLabel,
  DataListItem,
  DataListItemValue,
  Badge,
  Avatar,
  Group,
  Stack,
} from "@mantine/core";
import dayjs from "dayjs";
import { ChangePassword } from "@/components/admin/forms/ChangePassword";
import { ChangeUsername } from "@/components/admin/forms/ChangeUsername";

export async function AccountSettingsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) redirect("/login");

  const { user } = session;

  return (
    <Container>
      <Title order={2} mb="md">
        Settings
      </Title>
      <Text c="dimmed" mb="sm">
        Manage your account information
      </Text>
      <Divider mb={"40"} />

      <Stack gap={"4rem"}>
        <Fieldset
          p={"1.5rem"}
          legend={<Title order={4}>Account Information</Title>}
        >
          <Group mb={"xl"}>
            <Avatar
              variant={"light"}
              src={session?.user.image}
              radius={"md"}
              size={100}
            />
          </Group>
          <DataList size={"md"} gap={"md"} withDivider>
            <DataListItem>
              <DataListItemLabel>User ID</DataListItemLabel>
              <DataListItemValue>{user.id}</DataListItemValue>
            </DataListItem>
            <DataListItem>
              <DataListItemLabel>Name</DataListItemLabel>
              <DataListItemValue>{user.name}</DataListItemValue>
            </DataListItem>
            <DataListItem>
              <DataListItemLabel>Email</DataListItemLabel>
              <DataListItemValue>{user.email}</DataListItemValue>
            </DataListItem>
            <DataListItem>
              <DataListItemLabel>Created</DataListItemLabel>
              <DataListItemValue>
                {dayjs(user.createdAt).format("MMMM D, YYYY")}
              </DataListItemValue>
            </DataListItem>
            <DataListItem>
              <DataListItemLabel>Role</DataListItemLabel>
              <DataListItemValue>
                <Badge
                  bdrs={"md"}
                  color={user.role === "admin" ? "red" : "blue"}
                >
                  {user.role ?? "Unknown"}
                </Badge>
              </DataListItemValue>
            </DataListItem>
          </DataList>
        </Fieldset>

        <Fieldset
          p={"1.5rem"}
          legend={<Title order={4}>Account Security</Title>}
        >
          <Stack gap={"xl"}>
            <Stack gap={"sm"}>
              <Text size={"md"} fw={500}>
                Change Username
              </Text>
              <Divider />
              <ChangeUsername />
            </Stack>

            <Stack gap={"sm"}>
              <Text size={"md"} fw={500}>
                Change Password
              </Text>
              <Divider />
              <ChangePassword />
            </Stack>
          </Stack>
        </Fieldset>
      </Stack>
    </Container>
  );
}
