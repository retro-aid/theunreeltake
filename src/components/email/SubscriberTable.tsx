'use client';

import { useState } from 'react';
import {
  Table,
  Badge,
  ActionIcon,
  Paper,
  Text,
  Group,
  Box,
  Pagination,
} from '@mantine/core';
import {
  remove as removeSubscriberAction,
  list as listSubscribersAction,
} from '@/lib/actions/email/subscribers-actions';
import { CreateSubscriberModal, type ContactListItem } from './CreateSubscriberModal';
import { ErrorNotification } from './ErrorNotification';

export type { ContactListItem };

/**
 * Props accepted by the {@link SubscriberTable} component.
 */
interface SubscriberTableProps {
  /** Initial array of subscribers delivered during server-side render or streaming */
  initialSubscribers?: ContactListItem[];
  /** Flag determining if additional pages are available beyond the first batch */
  initialHasMore?: boolean;
}

const PAGE_SIZE = 10;

/**
 * Trash icon SVG component for the delete action button.
 */
function TrashIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
  );
}

/**
 * Plus icon SVG component for the add subscriber button.
 */
function PlusIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

/**
 * Administrative table component for managing Resend audience subscribers.
 * Features numbered button pagination, contact deletion, and addition modals.
 *
 * @param props - Configuration properties.
 * @param props.initialSubscribers - Initial records fetched during SSR/streaming.
 * @param props.initialHasMore - Initial boolean indicating whether next pages exist.
 * @returns The rendered subscriber management view.
 */
export function SubscriberTable({
  initialSubscribers = [],
  initialHasMore = false,
}: SubscriberTableProps) {
  /**
   * Cached array of loaded pages to permit seamless back-and-forth traversal
   * across Resend's cursor-based pagination boundaries.
   */
  const [pages, setPages] = useState<ContactListItem[][]>([initialSubscribers]);

  const [activePage, setActivePage] = useState(1);

  const [lastPageHasMore, setLastPageHasMore] = useState(initialHasMore);

  const [isLoadingPage, setIsLoadingPage] = useState(false);

  const [modalOpened, setModalOpened] = useState(false);

  const currentSubscribers = pages[activePage - 1] || [];

  /**
   * Calculates the total number of page buttons to display.
   * If the last loaded page still has more items, an additional page number is rendered.
   */
  const totalPages = lastPageHasMore ? pages.length + 1 : pages.length;

  /**
   * Optimistically prepends a new contact to page 1 and navigates to it.
   *
   * @param newContact - The newly created contact item.
   */
  const handleAddSubscriber = (newContact: ContactListItem) => {
    setPages((prev) => {
      const firstPage = prev[0] ? [newContact, ...prev[0]] : [newContact];
      return [firstPage, ...prev.slice(1)];
    });
    setActivePage(1);
  };

  /**
   * Deletes a contact by ID with optimistic UI rollback on error.
   *
   * @param id - Resend contact UUID to remove.
   */
  const handleDelete = async (id: string) => {
    const previousPages = pages;
    setPages((prev) =>
      prev.map((page) => page.filter((item) => item.id !== id))
    );

    try {
      const result = (await removeSubscriberAction({ id })) as {
        data?: any;
        error?: any;
      };

      if (result?.error) {
        ErrorNotification({
          title: 'Failed to Remove Subscriber',
          message:
            typeof result.error === 'string'
              ? result.error
              : result.error?.message || 'An unexpected error occurred.',
          httpCode: 400,
        });
        setPages(previousPages);
      }
    } catch (err: any) {
      ErrorNotification({
        title: 'Error',
        message: err?.message || 'Failed to remove contact.',
        httpCode: 500,
      });
      setPages(previousPages);
    }
  };

  /**
   * Handles page selection changes triggered from numbered pagination buttons or arrows.
   * Fetches newly requested pages on-demand using cursor pagination if not yet in cache.
   *
   * @param targetPage - The 1-based page number selected by the user.
   */
  const handlePageChange = async (targetPage: number) => {
    if (targetPage === activePage || isLoadingPage) return;

    if (targetPage <= pages.length) {
      setActivePage(targetPage);
      return;
    }

    const lastPageItems = pages[pages.length - 1];
    const lastItem = lastPageItems?.[lastPageItems.length - 1];

    if (!lastItem) return;

    setIsLoadingPage(true);

    try {
      const result = (await listSubscribersAction({
        paginateOption: 'after',
        after: lastItem.id,
        limit: PAGE_SIZE,
      } as any)) as { data?: { data: ContactListItem[]; has_more: boolean }; error?: any };

      if (result?.data?.data) {
        const newContacts = result.data.data;
        setPages((prev) => [...prev, newContacts]);
        setLastPageHasMore(Boolean(result.data.has_more));
        setActivePage(targetPage);
      } else if (result?.error) {
        ErrorNotification({
          title: 'Pagination Error',
          message: typeof result.error === 'string' ? result.error : 'Failed to load page.',
          httpCode: 400,
        });
      }
    } catch (err: any) {
      ErrorNotification({
        title: 'Error',
        message: err?.message || 'Failed to fetch page.',
        httpCode: 500,
      });
    } finally {
      setIsLoadingPage(false);
    }
  };

  return (
    <>
      <Box
        style={{
          width: '100%',
          minHeight: 'calc(100vh - 4rem)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '1.5rem',
        }}
      >
        <Paper
          withBorder
          radius="md"
          p="md"
          bg="white"
          shadow="xs"
          style={{
            width: '100%',
            maxWidth: '1000px',
          }}
        >
          {/* Header */}
          <Group justify="space-between" align="center" mb="md">
            <div>
              <Text fw={700} size="lg">Subscribers</Text>
            </div>
            <ActionIcon
              size="lg"
              radius="sm"
              onClick={() => setModalOpened(true)}
              title="Add Subscriber"
              style={{
                backgroundColor: '#e0f2fe',
                color: '#0284c7',
                border: '1px solid #bae6fd',
              }}
            >
              <PlusIcon />
            </ActionIcon>
          </Group>

          {/* Table */}
          <Table verticalSpacing="sm" horizontalSpacing="md" highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>First Name</Table.Th>
                <Table.Th>Last Name</Table.Th>
                <Table.Th>Email</Table.Th>
                <Table.Th>Date Subscribed</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {currentSubscribers.length === 0 ? (
                <Table.Tr>
                  <Table.Td colSpan={6} style={{ textAlign: 'center', padding: '2.5rem' }}>
                    <Text c="dimmed" size="sm">No subscribers found in this audience.</Text>
                  </Table.Td>
                </Table.Tr>
              ) : (
                currentSubscribers.map((item) => (
                  <Table.Tr key={item.id}>
                    <Table.Td>{item.first_name || '—'}</Table.Td>
                    <Table.Td>{item.last_name || '—'}</Table.Td>
                    <Table.Td>{item.email}</Table.Td>
                    <Table.Td>
                      {item.created_at
                        ? new Date(item.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })
                        : '—'}
                    </Table.Td>
                    <Table.Td>
                      <Badge
                        color={item.unsubscribed ? 'orange' : 'teal'}
                        variant="light"
                        radius="sm"
                      >
                        {item.unsubscribed ? 'Unsubscribed' : 'Active'}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <ActionIcon
                        color="red"
                        variant="filled"
                        size="md"
                        radius="sm"
                        onClick={() => handleDelete(item.id)}
                        title="Delete Subscriber"
                      >
                        <TrashIcon />
                      </ActionIcon>
                    </Table.Td>
                  </Table.Tr>
                ))
              )}
            </Table.Tbody>
          </Table>

          {/* Numbered Pagination Control (< 1 2 3 4 >) */}
          <Group justify="flex-end" mt="md">
            <Pagination
              value={activePage}
              onChange={handlePageChange}
              total={Math.max(1, totalPages)}
              disabled={isLoadingPage}
              size="sm"
              radius="md"
              withEdges={false}
              styles={{
                control: {
                  border: '1px solid #dee2e6',
                  color: '#495057',
                  '&[dataActive]': {
                    backgroundColor: '#6c757d',
                    borderColor: '#6c757d',
                    color: '#ffffff',
                  },
                },
              }}
            />
          </Group>
        </Paper>
      </Box>

      <CreateSubscriberModal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        onSubscriberCreated={handleAddSubscriber}
      />
    </>
  );
}

export default SubscriberTable;