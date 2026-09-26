"use client";

import {Modal, Button, Group, Text, Textarea} from "@mantine/core";
import { useState } from "react";

interface DeletePostModalProps {
  title?: string;
  description?: string;
  opened: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

interface ReplyPostModalProps {
  title?: string;
  description?: string;
  opened: boolean;
  onClose: () => void;
  onConfirm: (message : string) => void | Promise<void>;
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

export function ReplyActionModal(
  { title, description, opened, onClose, onConfirm }: ReplyPostModalProps
) {

  const [message, setMessage] = useState("");
  const [isPending, setIsPending] = useState(false);

  const handleClose = () => {
    setMessage("");
    onClose();
  };

  const handleConfirm = async () => {
    setIsPending(true);
    try {
      onConfirm(message);
      setMessage("");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={title ?? "Reply to comment"}
      centered
    >
      {description && (
        <Text size="sm" mb="md">
          {description}
        </Text>
      )}

      <Textarea
        placeholder="Write your reply..."
        minRows={4}
        autosize
        value={message}
        onChange={(e) => setMessage(e.currentTarget.value)}
        disabled={isPending}
      />

      <Group justify="flex-end" mt="xl">
        <Button variant="default" onClick={handleClose} disabled={isPending}>
          Cancel
        </Button>

        <Button
          color="green"
          onClick={handleConfirm}
          loading={isPending}
          disabled={!message.trim()}
        >
          Post Reply
        </Button>
      </Group>
    </Modal>
  );
}
