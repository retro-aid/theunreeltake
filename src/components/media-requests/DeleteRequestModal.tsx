"use client";

import { Button, Group, Modal, Text } from "@mantine/core";

type DeleteRequestModalProps = {
  opened: boolean;
  deleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

/**
 * Displays a confirmation modal before deleting a media request.
 *
 * @param props - Modal state and deletion callbacks.
 * @returns The delete confirmation modal.
 */
export default function DeleteRequestModal({
  opened,
  deleting,
  onClose,
  onConfirm,
}: DeleteRequestModalProps) {
  return (
    <Modal opened={opened} onClose={onClose} title="Delete Request" centered>
      <Text size="sm">Are you sure you want to delete this request?</Text>

      <Group justify="flex-end" mt="md">
        <Button variant="default" onClick={onClose}>
          Cancel
        </Button>

        <Button color="red" onClick={onConfirm} loading={deleting}>
          Delete
        </Button>
      </Group>
    </Modal>
  );
}
