"use client";

import { Button, Group, Modal, Text } from "@mantine/core";

type DeleteRequestModalProps = {
  opened: boolean;
  deleting: boolean;
  onCloseAction: () => void;
  onConfirmAction: () => void;
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
  onCloseAction,
  onConfirmAction,
}: DeleteRequestModalProps) {
  return (
    <Modal
      opened={opened}
      onClose={onCloseAction}
      title="Delete Request"
      centered
    >
      <Text size="sm">Are you sure you want to delete this request?</Text>

      <Group justify="flex-end" mt="md">
        <Button variant="default" onClick={onCloseAction}>
          Cancel
        </Button>

        <Button color="red" onClick={onConfirmAction} loading={deleting}>
          Delete
        </Button>
      </Group>
    </Modal>
  );
}
