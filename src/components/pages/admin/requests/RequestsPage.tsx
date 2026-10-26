"use client";

import { Box, Group, Pagination, Title, Flex } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useCallback, useEffect, useState, useTransition } from "react";

import GridReview from "@/components/media-requests/GridReview";
import ReplyRequestModal from "@/components/media-requests/ReplyRequestModal";
import DeleteRequestModal from "@/components/media-requests/DeleteRequestModal";

import { SearchBar } from "@/components/generic/SearchBar";
import RequestActionButtons from "@/app/ui/admin/RequestActionButtons";
import RefreshDataButton from "@/app/ui/home/RefreshDataButton";

import type { RequestDTO } from "@/lib/dal/dto/media-requests";
import {
  replyToRequestAction,
  getMediaRequestsAction,
  deleteRequestAction,
} from "@/lib/actions/media-request-actions";

const limit = 10;
/**
 * Manages request listing, filtering, selection, and request actions.
 *
 * @returns The interactive media request management interface.
 */
export default function RequestsPage() {
  const [selectedId, setSelectedId] = useState<string | undefined>();
  const [requests, setRequests] = useState<RequestDTO[]>([]);
  const selectedItem = requests.find((item) => item.id === selectedId);
  const [page, setPage] = useState(1);
  const [type, setType] = useState("");
  const [sort, setSort] = useState("");
  const [search, setSearch] = useState("");
  const [total, setTotal] = useState(0);
  const [deleteOpened, { open: openDelete, close: closeDelete }] =
    useDisclosure(false);
  const [replyOpened, { open: openReply, close: closeReply }] =
    useDisclosure(false);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [isLoading, startTransition] = useTransition();

  /**
   * Updates the search term and resets pagination and selection.
   *
   * @param value - Search text entered by the user.
   */
  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
    setSelectedId(undefined);
  };

  /**
   * Filters requests by media type.
   *
   * @param value - Selected media type.
   */
  const handleFilter = (value: string) => {
    setType(value);
    setPage(1);
    setSelectedId(undefined);
  };

  /**
   * Updates the request sorting order.
   *
   * @param value - Selected sort option.
   */
  const handleSort = (value: string) => {
    setSort(value);
    setPage(1);
    setSelectedId(undefined);
  };

  /**
   * Opens the reply modal for the request whose card was clicked.
   *
   * @param id - ID of the request being replied to.
   */
  const startReply = (id: string) => {
    setSelectedId(id);
    openReply();
  };

  /**
   * Opens the delete confirmation for the request whose card was clicked.
   *
   * @param id - ID of the request being deleted.
   */
  const startDelete = (id: string) => {
    setSelectedId(id);
    openDelete();
  };

  const refresh = useCallback(() => {
    startTransition(async () => {
      try {
        const result = await getMediaRequestsAction({
          page,
          limit,
          search,
          type,
          sort,
        });

        if (result.success) {
          setRequests(result.data);
          setTotal(Math.ceil(result.total / limit));
        } else {
          setRequests([]);
          setTotal(0);
        }
      } catch (error) {
        console.error("Failed to load requests:", error);
        setRequests([]);
        setTotal(0);
      }
    });
  }, [page, search, type, sort]);
  useEffect(() => {
    refresh();
  }, [refresh]);
  const handleDelete = async () => {
    if (!selectedItem || deleting) return;

    setDeleting(true);

    try {
      await deleteRequestAction(selectedItem.id);
      closeDelete();
      setSelectedId(undefined);
      refresh();
    } catch (error) {
      console.error("Delete failed:", error);
    } finally {
      setDeleting(false);
    }
  };

  const handleSend = async () => {
    if (!selectedItem || !message.trim() || sending) return;

    setSending(true);

    try {
      await replyToRequestAction(selectedItem.id, message);
      closeReply();
      setMessage("");
      refresh();
    } catch (error) {
      console.error("Send failed:", error);
    } finally {
      setSending(false);
    }
  };

  return (
    <Box p="lg">
      <Title order={2} mb="md">
        Requests
      </Title>

      {selectedItem && (
        <>
          <ReplyRequestModal
            opened={replyOpened}
            recipient={selectedItem.email}
            recipientName={selectedItem.name ?? selectedItem.email}
            message={message}
            sending={sending}
            onClose={closeReply}
            onMessageChange={setMessage}
            onSend={handleSend}
          />

          <DeleteRequestModal
            opened={deleteOpened}
            deleting={deleting}
            onClose={closeDelete}
            onConfirm={handleDelete}
          />
        </>
      )}

      <Group mb="md">
        <Flex miw={500}>
          <SearchBar onSearchAction={handleSearch} />
        </Flex>

        <RequestActionButtons
          onSortByAction={handleSort}
          onFilterByTypeAction={handleFilter}
        />

        <RefreshDataButton updateData={refresh} />
      </Group>

      {!isLoading && (
        <>
          <GridReview
            data={requests}
            onReplyAction={startReply}
            onDeleteAction={startDelete}
          />

          <Group mt="xl">
            <Pagination
              total={total}
              value={page}
              onChange={(nextPage) => {
                setPage(nextPage);
                setSelectedId(undefined);
              }}
            />
          </Group>
        </>
      )}
    </Box>
  );
}
