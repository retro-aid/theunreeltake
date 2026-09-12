"use client";

import {Modal, Button, Group, Text} from "@mantine/core";

interface DeletePostModalProps {
  title?: string;
  description?: string;
  opened: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteActionModal(
  { title, description, opened, onClose, onConfirm}: DeletePostModalProps
) {

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={title}
      centered
    >
      <Text size="sm" mb="xl">
        {description}
      </Text>

      <Group justify="flex-end">
        <Button variant="default" onClick={onClose}>
          No, Keep
        </Button>

        <Button color="red" onClick={onConfirm}>
          Yes, Delete
        </Button>
      </Group>
    </Modal>
  );
}
