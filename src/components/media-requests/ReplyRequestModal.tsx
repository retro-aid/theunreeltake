"use client";

import {
  Button,
  Group,
  Modal,
  Stack,
  TextInput,
  Textarea,
} from "@mantine/core";

type ReplyRequestModalProps = {
  opened: boolean;
  recipient: string;
  recipientName: string;
  message: string;
  sending: boolean;
  onCloseAction: () => void;
  onMessageChangeAction: (message: string) => void;
  onSendAction: () => void;
};

/**
 * Renders the modal used to compose and send a reply to a media request.
 *
 * @param props - Modal state, recipient details, and event callbacks.
 * @returns The reply modal.
 */
export default function ReplyRequestModal({
  opened,
  recipient,
  recipientName,
  message,
  sending,
  onCloseAction,
  onMessageChangeAction,
  onSendAction,
}: ReplyRequestModalProps) {
  return (
    <Modal
      opened={opened}
      onClose={onCloseAction}
      title={`Reply to ${recipientName}`}
      centered
    >
      <Stack>
        <TextInput label="To" value={recipient} disabled />
        <Textarea
          label="Your response"
          placeholder="Type your reply..."
          value={message}
          onChange={(event) => onMessageChangeAction(event.currentTarget.value)}
          minRows={5}
          autosize
        />

        <Group justify="flex-end">
          <Button variant="default" onClick={onCloseAction}>
            Cancel
          </Button>

          <Button
            onClick={onSendAction}
            loading={sending}
            disabled={!message.trim()}
          >
            Send
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
