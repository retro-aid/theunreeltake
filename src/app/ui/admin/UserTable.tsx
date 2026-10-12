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
} from "@mantine/core";
import { getAllUsers, deleteUser, updateUser } from "@/lib/actions";
import { useState, useContext, useTransition, useEffect } from "react";
import { AuthContext } from "@/app/ui/admin/AuthContext";
import { User } from "@/generated/prisma/client";
import { zod4Resolver } from "mantine-form-zod-resolver";
import { EditUserSchema } from "@/lib/schemas";
import { useForm } from "@mantine/form";

const PAGE_SIZE = 10;

export function UserTable() {
  const [page, setPage] = useState(1);
  const [users, setUsers] = useState<NonNullable<User[]>>([]);
  const [isLoading, startTransition] = useTransition();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [modalOpened, setModalOpened] = useState(false);
  const [activeModal, setActiveModal] = useState<string | null>(null);
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
        <Avatar src={user.image} alt={user.name} radius="xl">
          {user.name
            ?.split(" ")
            .slice(0, 2)
            .map((x) => x[0])}
        </Avatar>
      </Table.Td>
      <Table.Td>{user.name}</Table.Td>
      <Table.Td>{user.email}</Table.Td>
      <Table.Td>
        <Badge
          color={user.role === "admin" ? "green" : "red"}
          variant="light"
          mr={"sm"}
        >
          {user.role}
        </Badge>
      </Table.Td>
      <Table.Td>
        <Group gap="xs">
          <Button
            size="sm"
            variant="light"
            onClick={() => {
              setSelectedUserId(user.id);
              setModalOpened(true);
              setActiveModal("edit");
            }}
          >
            Edit
          </Button>
          <Button size="sm" variant="light">
            Message
          </Button>
          <Button
            size="sm"
            color="red"
            variant="light"
            onClick={() => {
              setSelectedUserId(user.id);
              setModalOpened(true);
              setActiveModal("delete");
            }}
          >
            Delete
          </Button>
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
        </Modal>
      )}

      <Box p="lg">
        <Stack style={{ flex: 1 }} gap="md">
          <Paper
            withBorder
            radius="md"
            shadow="md"
            style={{ overflowX: "auto" }}
          >
            <Table
              striped
              highlightOnHover
              verticalSpacing="md"
              horizontalSpacing="lg"
              style={{ whiteSpace: "nowrap" }}
            >
              <Table.Thead style={{ backgroundColor: "#3673C9" }}>
                <Table.Tr>
                  <Table.Th></Table.Th>
                  <Table.Th>Username</Table.Th>
                  <Table.Th>Email</Table.Th>
                  <Table.Th>Role</Table.Th>
                  <Table.Th></Table.Th>
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
          <Box>{pagedData.length} Users</Box>
        </Group>
      </Box>
    </>
  );
}
