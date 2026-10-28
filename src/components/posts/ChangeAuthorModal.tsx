"use client";

import React, { useEffect, useState } from "react";
import {
  Modal,
  Button,
  Group,
  Select,
  Avatar,
  Text,
  Stack,
  ComboboxItem,
  SelectProps,
} from "@mantine/core";

export type UserOption = {
  id: string;
  name?: string | null;
  email: string;
  image?: string | null;
};

interface ChangeAuthorModalProps {
  opened: boolean;
  onClose: () => void;
  onConfirm: (newAuthorId: string) => Promise<void>;
  currentAuthorId?: string;
  fetchUsersAction?: () => Promise<UserOption[]>;
}

/**
 * Custom selection option renderer displaying user avatar, name, and email.
 */
const renderSelectOption: SelectProps["renderOption"] = ({ option }) => {
  const customData = option as ComboboxItem & {
    email?: string;
    image?: string;
  };

  return (
    <Group gap="sm" wrap="nowrap" py={4}>
      <Avatar src={customData.image} radius="xl" size="md">
        {customData.label?.slice(0, 2).toUpperCase()}
      </Avatar>
      <Stack gap={0}>
        <Text size="sm" fw={500} lineClamp={1}>
          {customData.label}
        </Text>
        <Text size="xs" c="dimmed" lineClamp={1}>
          {customData.email}
        </Text>
      </Stack>
    </Group>
  );
};

/**
 * Modal prompting an admin to change the owner of a post.
 */
export function ChangeAuthorModal({
  opened,
  onClose,
  onConfirm,
  currentAuthorId,
  fetchUsersAction,
}: ChangeAuthorModalProps) {
  const [users, setUsers] = useState<UserOption[]>([]);
  const [selectedAuthorId, setSelectedAuthorId] = useState<string | null>(
    currentAuthorId ?? null,
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);

  useEffect(() => {
    if (!opened || !fetchUsersAction) return;

    fetchUsersAction()
      .then((res) => setUsers(res || []))
      .finally(() => setIsLoadingUsers(false));
  }, [opened, fetchUsersAction]);

  const selectData = users.map((u) => ({
    value: u.id,
    label: u.name || u.email,
    email: u.email,
    image: u.image ?? undefined,
  }));

  const handleSave = async () => {
    if (!selectedAuthorId) return;
    setIsSaving(true);
    await onConfirm(selectedAuthorId);
    setIsSaving(false);
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Change Post Author"
      centered
    >
      <Stack gap="md">
        <Select
          label="Select an author"
          placeholder="Search for user"
          data={selectData}
          value={selectedAuthorId}
          onChange={setSelectedAuthorId}
          renderOption={renderSelectOption}
          searchable
          allowDeselect={false}
          disabled={isLoadingUsers}
          maxDropdownHeight={280}
        />

        <Group justify="flex-end" mt="md">
          <Button variant="default" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button
            color="blue"
            onClick={handleSave}
            loading={isSaving}
            disabled={!selectedAuthorId || selectedAuthorId === currentAuthorId}
          >
            Save
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
