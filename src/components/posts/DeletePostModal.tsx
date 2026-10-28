"use client";

import { Modal, Button, Group, Text } from "@mantine/core";
/**
 * Defines the props shared by the post modals.
 *
 * @property opened - Whether the modal is visible.
 * @property onClose - Callback invoked when the modal is closed or canceled.
 * @property onConfirm - Callback invoked when the user confirms.
 */
interface DeletePostModalProps {
  opened: boolean;
  onClose: () => void;
  onConfirm: () => void;
}
/**
 * Renders a confirmation modal before deleting a post.
 *
 * @param props - The modal's properties.
 * @param props.opened - Whether the modal is visible.
 * @param props.onClose - Closes the modal and does not delete.
 * @param props.onConfirm - Confirms the deletion.
 */
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
/**
 * Renders a confirmation modal before leaving the post editor.
 *
 * @param props - The modal's properties.
 * @param props.opened - Whether the modal is visible.
 * @param props.onClose - Closes the modal and returns the user to editing.
 * @param props.onConfirm - Confirms leaving the editor without saving changes.
 */
export function CancelPostModal({
  opened,
  onClose,
  onConfirm,
}: DeletePostModalProps) {
  return (
    <Modal opened={opened} onClose={onClose} title="Return to Post?" centered>
      <Text size="sm" mb="xl">
        Your changes will not be saved!
      </Text>

      <Group justify="flex-end">
        <Button variant="default" onClick={onClose}>
          Return to edit
        </Button>

        <Button color="red" onClick={onConfirm}>
          Proceed
        </Button>
      </Group>
    </Modal>
  );
}
