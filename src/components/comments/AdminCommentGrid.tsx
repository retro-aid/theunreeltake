"use client";

import { CulledAdminComment } from "@/lib/dal/dto/comments";
import { AdminCommentCard } from "@/components/comments/cards";
import { ActionMenuOption } from "@/components/generic/ActionButtons";
import { ScrollableGrid } from "@/components/generic/ScrollableGrid";

const sortOptions: ActionMenuOption[] = [
  { label: "User Name (A-Z)", value: "username-asc" },
  { label: "User Name (Z-A)", value: "username-desc" },
  { label: "User ID (A-Z)", value: "userId-asc" },
  { label: "User ID (Z-A)", value: "userId-desc" },
  { label: "Email (A-Z)", value: "email-asc" },
  { label: "Email (Z-A)", value: "email-desc" },
  { label: "Date Posted (Old - New)", value: "createdAt-asc" },
  { label: "Date Posted (New - Old)", value: "createdAt-desc" },
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

/**
 * URT 388 change:
 * Renders the admin comments feed using the generic {@link ScrollableGrid} component.
 * Basically it still keeps the comments layout and doesn't affect its components
 *
 * @remarks
 * Refactored to utilize `ScrollableGrid<CulledAdminComment>` configured in `stack` mode,
 * paginated to 5 items per batch with built-in sorting and height constraints.
 *
 * @param props - Props containing the comments to display.
 * @returns The comment card stream wrapped in the generic scrollable grid.
 */
export function AdminCommentGrid({
  comments,
}: {
  comments: CulledAdminComment[];
}) {
  return (
    <ScrollableGrid<CulledAdminComment>
      data={comments}
      layout="stack"
      pageSize={5}
      height={700}
      keyExtractor={(item) => item.id}
      renderItem={(comment) => <AdminCommentCard comment={comment} />}
      sortOptions={sortOptions}
      onSort={sortComments}
    />
  );
}
