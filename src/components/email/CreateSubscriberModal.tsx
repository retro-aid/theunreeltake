'use client';

import { useState } from 'react';
import { Button, Modal, TextInput, Checkbox, Group, Stack, Text } from '@mantine/core';
import { create as createSubscriberAction } from '@/lib/actions/email/subscribers-actions';
import { ErrorNotification } from './ErrorNotification';

/**
 * Represents a single subscriber item displayed in the subscriber view.
 */
export interface ContactListItem {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  created_at: string;
  unsubscribed: boolean;
}


interface CreateSubscriberModalProps {
  opened: boolean;
  onClose: () => void;
  onSubscriberCreated: (subscriber: ContactListItem) => void;
}

/**
 * Modal form allowing administrators to create and register a new contact in Resend.
 *
 * @param props - Component configuration props.
 * @param props.opened - Flag indicating if modal is open.
 * @param props.onClose - Handler invoked on backdrop click or cancellation.
 * @param props.onSubscriberCreated - Callback passing the created {@link ContactListItem}.
 * @returns The rendered Mantine modal component.
 */
export function CreateSubscriberModal({
  opened,
  onClose,
  onSubscriberCreated,
}: CreateSubscriberModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [unsubscribed, setUnsubscribed] = useState(false);

  /**
   * Validates form input and submits the contact creation payload to the server action.
   *
   * @param e - The synthetic form submission event.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !firstName.trim() || !lastName.trim()) {
      ErrorNotification({
        title: 'Validation Error',
        message: 'Email, First Name, and Last Name are required.',
        httpCode: 422,
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const trimmedEmail = email.trim().toLowerCase();
      const trimmedFirst = firstName.trim();
      const trimmedLast = lastName.trim();

      const result = (await createSubscriberAction({
        email: trimmedEmail,
        firstName: trimmedFirst,
        lastName: trimmedLast,
        unsubscribed,
      } as any)) as { data?: { id: string }; error?: any };

      if (result?.error) {
        ErrorNotification({
          title: 'Failed to Add Subscriber',
          message:
            typeof result.error === 'string'
              ? result.error
              : result.error?.message || 'Resend was unable to create contact.',
          httpCode: 400,
        });
        return;
      }

      if (result?.data) {
        onSubscriberCreated({
          id: result.data.id,
          email: trimmedEmail,
          first_name: trimmedFirst,
          last_name: trimmedLast,
          created_at: new Date().toISOString(),
          unsubscribed,
        });
      }

      onClose();
      setEmail('');
      setFirstName('');
      setLastName('');
      setUnsubscribed(false);
    } catch (err: any) {
      ErrorNotification({
        title: 'Error',
        message: err?.message || 'An unexpected error occurred.',
        httpCode: 500,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Resets internal fields and invokes the parent close handler.
   */
  const handleClose = () => {
    onClose();
    setUnsubscribed(false);
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={<Text fw={600}>Add New Subscriber</Text>}
      centered
      radius="md"
    >
      <form onSubmit={handleSubmit}>
        <Stack gap="sm">
          <TextInput
            required
            label="Email"
            placeholder="user@example.com"
            value={email}
            onChange={(e) => setEmail(e.currentTarget.value)}
          />
          <TextInput
            required
            label="First Name"
            placeholder="John"
            value={firstName}
            onChange={(e) => setFirstName(e.currentTarget.value)}
          />
          <TextInput
            required
            label="Last Name"
            placeholder="Doe"
            value={lastName}
            onChange={(e) => setLastName(e.currentTarget.value)}
          />
          <Checkbox
            label="Mark as unsubscribed"
            checked={unsubscribed}
            onChange={(e) => setUnsubscribed(e.currentTarget.checked)}
            mt="xs"
          />

          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              loading={isSubmitting}
              style={{
                backgroundColor: '#e0f2fe',
                color: '#0284c7',
                border: '1px solid #bae6fd',
              }}
            >
              Save Contact
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}