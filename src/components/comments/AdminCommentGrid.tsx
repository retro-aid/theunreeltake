"use client";

/**
 * Refactor the changes made in this AdminCommentGrid so the new changes are in a separate called AdminCommentCard.tsx
 * functionality still works and the updated redesign is still there.
 */
import React, { useState } from "react";
import { useDisclosure } from "@mantine/hooks";
import { CulledAdminComment } from "@/lib/dal/dto/comments";
import { AdminCommentCard } from "@/components/comments/AdminCommentCard";
import { deleteCommentAction } from "@/lib/actions/comment-actions";
import { DeleteActionModal } from "@/components/generic/modals";
import { ActionMenuOption } from "@/components/generic/ActionButtons";
import { ScrollableGrid } from "@/components/generic/ScrollableGrid";

const sortOptions: ActionMenuOption[] = [
  { label: "Newest First", value: "createdAt-desc" },
  { label: "Oldest First", value: "createdAt-asc" },
  { label: "User Name (A-Z)", value: "username-asc" },
  { label: "User Name (Z-A)", value: "username-desc" },
  { label: "Email (A-Z)", value: "email-asc" },
  { label: "Email (Z-A)", value: "email-desc" },
];

function sortComments(comments: CulledAdminComment[], sort: string) {
  if (!sort) return comments;

  const [key, direction] = sort.split("-") as [
    "username" | "userId" | "email" | "createdAt",
    "asc" | "desc",
  ];
  const order = direction === "asc" ? 1 : -1;

  return [...comments].sort((a, b) => {
    const result =
      key === "createdAt"
        ? a.createdAt.getTime() - b.createdAt.getTime()
        : (a[key] ?? "").localeCompare(b[key] ?? "");

    return result * order;
  });
}

export interface AdminCommentGridProps {
  comments: CulledAdminComment[];
  headerLeft?: React.ReactNode;
  onReply?: (comment: CulledAdminComment) => void;
  onRefresh?: () => void;
}

export function AdminCommentGrid({
  comments,
  headerLeft,
  onReply,
  onRefresh,
}: AdminCommentGridProps) {
  const [
    deleteModalOpened,
    { open: openDeleteModal, close: closeDeleteModal },
  ] = useDisclosure(false);
  const [selectedCommentId, setSelectedCommentId] = useState<string | null>(
    null,
  );

  const handleDeleteClick = (commentId: string) => {
    setSelectedCommentId(commentId);
    openDeleteModal();
  };

  const handleConfirmDelete = async () => {
    if (selectedCommentId) {
      await deleteCommentAction(selectedCommentId);
      closeDeleteModal();
      setSelectedCommentId(null);
    }
  };

  return (
    <>
      <DeleteActionModal
        title="Delete Comment?"
        description="This action cannot be undone!"
        opened={deleteModalOpened}
        onClose={closeDeleteModal}
        onConfirm={handleConfirmDelete}
      />

      <ScrollableGrid<CulledAdminComment>
        data={comments}
        layout="stack"
        pageSize={5}
        height={700}
        keyExtractor={(item) => item.id}
        renderItem={(comment) => (
          <AdminCommentCard
            comment={comment}
            onDeleteClick={handleDeleteClick}
            onReply={onReply}
          />
        )}
        sortOptions={sortOptions}
        onSort={sortComments}
        onRefresh={onRefresh}
        headerLeft={headerLeft}
      />
    </>
  );
}