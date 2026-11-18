"use client";

import {
  Box,
  Button,
  Stack,
  Table,
  Pagination,
  Badge,
  Group,
  Paper,
  Avatar,
  Modal,
  Text,
  TextInput,
  Select,
  Menu,
  ActionIcon,
} from "@mantine/core";
import { ThreeDots, Trash, PencilSquare } from "react-bootstrap-icons";
import { getAllUsers, deleteUser, updateUser } from "@/lib/actions";
import { useState, useContext, useTransition, useEffect } from "react";
import { AuthContext } from "@/components/admin/AuthContext";
import { User } from "@/generated/prisma/client";
import { zod4Resolver } from "mantine-form-zod-resolver";
import { EditUserSchema } from "@/lib/schemas";
import { useForm } from "@mantine/form";
import { InviteUserModal } from "@/components/admin/InviteUserModal";

const PAGE_SIZE = 10;

/**
 * Displays a table of users with the options to edit, delete, and message.
 * Retrieves the data from database and displays them in a table.
 * Option to invite new users to the website.
 *
 * @returns The user management table
 */
export function UserTable() {
  const [page, setPage] = useState(1);
  const [users, setUsers] = useState<NonNullable<User[]>>([]);
  const [isLoading, startTransition] = useTransition();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [modalOpened, setModalOpened] = useState(false);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [inviteOpened, setInviteOpened] = useState(false);
  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      name: "",
      role: "",
    },
    validate: zod4Resolver(EditUserSchema),
    validateInputOnChange: true,
  });

  const authContext = useContext(AuthContext);

  useEffect(() => {
    startTransition(async () => {
      const data = await getAllUsers(authContext.user.id);

      if (!data) {
        console.log("Database error");
        return;
      }

      setUsers(data);
    });
  }, [authContext.user.id]);

  if (isLoading) return <div>Loading...</div>;

  const pagedData = users.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const rows = pagedData.map((user) => (
    <Table.Tr key={user.id}>
      <Table.Td>
        <Avatar src={user.image} alt={user.name} radius="xl" ml={"md"}>
          {user.name
            ?.split(" ")
            .slice(0, 2)
            .map((x) => x[0])}
        </Avatar>
      </Table.Td>
      <Table.Td>
        <Text title={user.name}>{user.name}</Text>
      </Table.Td>
      <Table.Td>
        <Text title={user.email}>{user.email}</Text>
      </Table.Td>
      <Table.Td>
        <Group>
          <Badge
            w={"100%"}
            bdrs={"md"}
            color={user.role === "admin" ? "red" : "blue"}
          >
            {user.role}
          </Badge>
        </Group>
      </Table.Td>
      <Table.Td>
        <Group justify={"right"} mr={"md"}>
          <Menu position="bottom-start">
            <Menu.Target>
              <ActionIcon variant="subtle" color={"gray.9"}>
                <ThreeDots></ThreeDots>
              </ActionIcon>
            </Menu.Target>

            <Menu.Dropdown>
              <Menu.Item
                leftSection={<PencilSquare />}
                onClick={() => {
                  setSelectedUserId(user.id);
                  setModalOpened(true);
                  setActiveModal("edit");
                }}
              >
                Edit
              </Menu.Item>

              <Menu.Item
                leftSection={<Trash />}
                color="red"
                onClick={() => {
                  setSelectedUserId(user.id);
                  setModalOpened(true);
                  setActiveModal("delete");
                }}
              >
                Delete
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>
      </Table.Td>
    </Table.Tr>
  ));
  /**
   * URT 386 changed:
   * Added input description for Edit User
   *
   * @remarks
   * the description from <Text Input> is part of "@mantine/core"
   *
   * @returns
   * returns the same layout but with now the input description added for better user experience
   * the users would be informed if the name is changed and/or the change in the role
   */
  return (
    <>
      {activeModal == "delete" && (
        <Modal
          opened={modalOpened}
          onClose={() => {
            setModalOpened(false);
            setActiveModal(null);
          }}
          title="Confirm Deletion"
        >
          <Text>Are you sure you want to delete this user?</Text>
          <Group mt="md">
            <Button
              variant="default"
              onClick={() => {
                setModalOpened(false);
                setActiveModal(null);
              }}
            >
              Cancel
            </Button>
            <Button
              color="red"
              onClick={async () => {
                if (selectedUserId) await deleteUser(selectedUserId);
                setModalOpened(false);
                setActiveModal(null);
              }}
            >
              Confirm
            </Button>
          </Group>
        </Modal>
      )}

      {activeModal == "edit" && (
        <Modal
          opened={modalOpened}
          onClose={() => {
            setModalOpened(false);
            setActiveModal(null);
          }}
          title="Edit User"
        >
          <Stack>
            <TextInput
              label="Change Name"
              description="Name will be visible to everyone"
              placeholder="Name"
              {...form.getInputProps("name")}
            ></TextInput>

            <Select
              label="Change Role"
              description="Role change would change their access abilities"
              placeholder="Role"
              data={["Admin", "User"]}
              {...form.getInputProps("role")}
            ></Select>

            <Group>
              <Button
                onClick={async () => {
                  const validation = form.validate();
                  if (validation.hasErrors) return;

                  const { name, role } = form.getValues();
                  if (!selectedUserId) return;
                  const result = await updateUser(selectedUserId, name, role);
                  console.log(result);
                  if (!result.success) {
                    alert("Failed to update user");
                    return;
                  }
                  setModalOpened(false);
                  setActiveModal(null);
                }}
              >
                Save
              </Button>

              <Button
                variant="default"
                onClick={() => {
                  setModalOpened(false);
                  setActiveModal(null);
                }}
              >
                Cancel
              </Button>
            </Group>
          </Stack>
        </Modal>
      )}

      <Box maw={"900"} w={"100%"}>
        <Group justify="flex-end" mb={"lg"}>
          <Button
            color="dark"
            radius="md"
            onClick={() => setInviteOpened(true)}
          >
            Invite a New User
          </Button>
        </Group>
        <InviteUserModal
          opened={inviteOpened}
          onCloseAction={() => setInviteOpened(false)}
        ></InviteUserModal>

        <Stack style={{ flex: 1 }} gap="md">
          <Paper withBorder radius="md">
            <Table highlightOnHover layout={"fixed"}>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th w={"7rem"}></Table.Th>
                  <Table.Th w={"12rem"}>Name</Table.Th>
                  <Table.Th w={"17rem"}>Email</Table.Th>
                  <Table.Th w={"5.25rem"} ta={"center"}>
                    Role
                  </Table.Th>
                  <Table.Th ta={"right"}>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>{rows}</Table.Tbody>
            </Table>
          </Paper>
        </Stack>
        <Group mt="lg" justify="space-between">
          <Pagination
            value={page}
            onChange={setPage}
            total={Math.ceil(users.length / PAGE_SIZE)}
          />
          <Box>Showing {pagedData.length} other users</Box>
        </Group>
      </Box>
    </>
  );
}
