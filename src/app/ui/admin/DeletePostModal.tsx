"use client";

import { Modal, Button, Group, Text } from "@mantine/core";

interface DeletePostModalProps {
  opened: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeletePostModal({
  opened,
  onClose,
  onConfirm,
}: DeletePostModalProps) {
  return (
    <Modal opened={opened} onClose={onClose} title="Delete Post?" centered>
      <Text size="sm" mb="xl">
        Are you sure you want to delete this post?
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
