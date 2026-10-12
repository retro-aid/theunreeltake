import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { headers } from "next/headers";
import prisma from "@/lib/__mocks__/prisma";
import * as crypto from "node:crypto";
import { getCurrentSession } from "@/lib/dal/utils";
import {
  createComment,
  createReply,
  deleteComment,
  getAdminComments,
  getAmountOfComments,
  getCommentsOnPost,
  getRepliesOnPost,
} from "@/lib/dal/dto/comments";
import { Comment } from "@/generated/prisma/client";

vi.mock(import("server-only"), () => {
  return {};
});

vi.mock(import("@/lib/prisma"));

vi.mock("next/headers", () => ({ headers: vi.fn() }));
vi.mock("@/lib/dal/utils", () => ({ getCurrentSession: vi.fn() }));

beforeEach(() => {
  vi.mocked(headers).mockResolvedValue(
    new Headers({
      "x-forwarded-for": "203.0.113.5",
      "user-agent": "vitest",
    }) as never,
  );
  vi.spyOn(console, "error").mockImplementation(() => {});
});

/**
 * Tests for creating an anonymous comment on a post
 *
 * Checks:
 *    Creates the comment and returns it
 *    Falls back to defaults for a blank username and empty email
 *    Returns undefined and creates nothing when the post does not exist
 *    Derives a stable SHA-256 user ID from the IP and user agent
 */
describe("createComment", () => {
  const post = { id: "post-1", slug: "alien-romulus" };

  it("creates the comment and returns it", async () => {
    const created = { id: "comment-1" } as Comment;
    prisma.post.findUniqueOrThrow.mockResolvedValueOnce(post as never);
    prisma.comment.create.mockResolvedValueOnce(created);

    const result = await createComment("alien-romulus", {
      username: "John Doe",
      email: "john.doe@example.com",
      message: "Great movie",
    });

    expect(result).toBe(created);
    expect(prisma.comment.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        username: "John Doe",
        email: "john.doe@example.com",
        messageContent: "Great movie",
        postId: "post-1",
        postSlug: "alien-romulus",
      }),
    });
  });

  it("uses Anonymous User and a null email when they are left blank", async () => {
    prisma.post.findUniqueOrThrow.mockResolvedValueOnce(post as never);
    prisma.comment.create.mockResolvedValueOnce({} as Comment);

    await createComment("alien-romulus", {
      username: null,
      email: "",
      message: "Great movie",
    });

    expect(prisma.comment.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        username: "Anonymous User",
        email: null,
      }),
    });
  });

  it("returns undefined and creates nothing when the post is not found", async () => {
    prisma.post.findUniqueOrThrow.mockRejectedValueOnce(
      new Error("No Post found"),
    );

    const result = await createComment("missing-post", {
      username: "John Doe",
      message: "Great movie",
    });

    expect(result).toBeUndefined();
    expect(prisma.comment.create).not.toHaveBeenCalled();
    expect(console.error).toHaveBeenCalled();
  });

  it("derives the user ID from a SHA-256 hash of the IP and user agent", async () => {
    prisma.post.findUniqueOrThrow.mockResolvedValueOnce(post as never);
    prisma.comment.create.mockResolvedValueOnce({} as Comment);
    const expectedId = crypto
      .createHash("sha256")
      .update("203.0.113.5:vitest")
      .digest("hex");

    await createComment("alien-romulus", {
      username: "John Doe",
      message: "Great movie",
    });

    expect(prisma.comment.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ userId: expectedId }),
    });
  });
});

/**
 * Tests for replying to an existing comment as the logged-in user
 *
 * Checks:
 *    Creates the reply with the session user's details and the parent's post
 *    Returns null when there is no logged-in user
 *    Returns null when the parent comment does not exist
 *    Refuses to reply to a comment that is itself a reply
 */
describe("createReply", () => {
  const session = {
    user: {
      id: "user-1",
      name: "John Doe",
      email: "john.doe@example.com",
      role: "admin",
    },
  };
  const parent = {
    id: "parent-1",
    postId: "post-1",
    postSlug: "alien-romulus",
    repliesToId: null,
  };

  it("creates the reply using the session user and the parent's post", async () => {
    const created = { id: "reply-1" } as Comment;
    vi.mocked(getCurrentSession).mockResolvedValueOnce(session as never);
    prisma.comment.findUniqueOrThrow.mockResolvedValueOnce(parent as never);
    prisma.comment.create.mockResolvedValueOnce(created);

    const result = await createReply("parent-1", "Agreed!");

    expect(result).toBe(created);
    expect(prisma.comment.create).toHaveBeenCalledWith({
      data: {
        username: "John Doe",
        email: "john.doe@example.com",
        messageContent: "Agreed!",
        userId: "user-1",
        postId: "post-1",
        postSlug: "alien-romulus",
        repliesToId: "parent-1",
      },
    });
  });

  it("returns null when there is no logged-in user", async () => {
    vi.mocked(getCurrentSession).mockRejectedValueOnce(
      new Error("Unauthorized"),
    );

    const result = await createReply("parent-1", "Agreed!");

    expect(result).toBeNull();
    expect(prisma.comment.create).not.toHaveBeenCalled();
  });

  it("returns null when the parent comment is not found", async () => {
    vi.mocked(getCurrentSession).mockResolvedValueOnce(session as never);
    prisma.comment.findUniqueOrThrow.mockRejectedValueOnce(
      new Error("No Comment found"),
    );

    const result = await createReply("missing-comment", "Agreed!");

    expect(result).toBeNull();
    expect(prisma.comment.create).not.toHaveBeenCalled();
  });

  it("refuses to reply to a comment that is already a reply", async () => {
    vi.mocked(getCurrentSession).mockResolvedValueOnce(session as never);
    prisma.comment.findUniqueOrThrow.mockResolvedValueOnce({
      ...parent,
      id: "reply-1",
      repliesToId: "parent-1",
    } as never);
    prisma.comment.create.mockResolvedValue({ id: "reply-2" } as Comment);

    const result = await createReply("reply-1", "Replying to a reply");

    expect(result).toBeNull();
    expect(prisma.comment.create).not.toHaveBeenCalled();
  });
});

/**
 * Tests for deleting a comment (admin only)
 *
 * Checks:
 *    An admin deletes the comment and gets the deleted record back
 *    A non-admin user is rejected without deleting anything
 *    A missing session is handled without deleting anything
 *    A database failure is caught and returns undefined
 */
describe("deleteComment", () => {
  it("deletes the comment and returns it when the user is an admin", async () => {
    const deleted = { id: "comment-1" } as Comment;
    vi.mocked(getCurrentSession).mockResolvedValueOnce({
      user: { id: "admin-1", role: "admin" },
    } as never);
    prisma.comment.delete.mockResolvedValueOnce(deleted);

    const result = await deleteComment("comment-1");

    expect(result).toBe(deleted);
    expect(prisma.comment.delete).toHaveBeenCalledWith({
      where: { id: "comment-1" },
    });
  });

  it("returns undefined and deletes nothing when the user is not an admin", async () => {
    vi.mocked(getCurrentSession).mockResolvedValueOnce({
      user: { id: "user-1", role: "user" },
    } as never);

    const result = await deleteComment("comment-1");

    expect(result).toBeUndefined();
    expect(prisma.comment.delete).not.toHaveBeenCalled();
    expect(console.error).toHaveBeenCalledWith("Unauthorized");
  });

  it("returns undefined and deletes nothing when there is no session", async () => {
    vi.mocked(getCurrentSession).mockRejectedValueOnce(
      new Error("Unauthorized"),
    );

    const result = await deleteComment("comment-1");

    expect(result).toBeUndefined();
    expect(prisma.comment.delete).not.toHaveBeenCalled();
  });

  it("returns undefined when the database delete fails", async () => {
    vi.mocked(getCurrentSession).mockResolvedValueOnce({
      user: { id: "admin-1", role: "admin" },
    } as never);
    prisma.comment.delete.mockRejectedValueOnce(new Error("Record not found"));

    const result = await deleteComment("missing-comment");

    expect(result).toBeUndefined();
    expect(console.error).toHaveBeenCalled();
  });
});

/**
 * Tests for fetching comments for the admin dashboard
 *
 * Checks:
 *    An admin receives every comment, newest first
 *    A regular user only receives comments on their own posts
 *    An unrecognised role receives an empty list without querying
 *    A missing session rejects with "Unauthorized"
 */
describe("getAdminComments", () => {
  const comments = [{ id: "comment-1" }, { id: "comment-2" }];

  it("returns every comment, newest first, for an admin", async () => {
    vi.mocked(getCurrentSession).mockResolvedValueOnce({
      user: { id: "admin-1", role: "admin" },
    } as never);
    prisma.comment.findMany.mockResolvedValueOnce(comments as never);

    const result = await getAdminComments();

    expect(result).toBe(comments);
    expect(prisma.comment.findMany).toHaveBeenCalledWith({
      omit: { repliesToId: true },
      include: { post: { select: { title: true } } },
      orderBy: { createdAt: "desc" },
    });
  });

  it("only returns comments on the user's own posts for a regular user", async () => {
    vi.mocked(getCurrentSession).mockResolvedValueOnce({
      user: { id: "user-1", role: "user" },
    } as never);
    prisma.comment.findMany.mockResolvedValueOnce(comments as never);

    const result = await getAdminComments();

    expect(result).toBe(comments);
    expect(prisma.comment.findMany).toHaveBeenCalledWith({
      where: { post: { author: { id: "user-1" } } },
      include: { post: { select: { title: true } } },
      omit: { repliesToId: true },
      orderBy: { createdAt: "desc" },
    });
  });

  it("returns an empty array without querying for an unrecognised role", async () => {
    vi.mocked(getCurrentSession).mockResolvedValueOnce({
      user: { id: "guest-1", role: "guest" },
    } as never);

    const result = await getAdminComments();

    expect(result).toStrictEqual([]);
    expect(prisma.comment.findMany).not.toHaveBeenCalled();
  });

  it("rejects with Unauthorized when there is no session", async () => {
    vi.mocked(getCurrentSession).mockRejectedValueOnce(
      new Error("Unauthorized"),
    );

    await expect(getAdminComments()).rejects.toThrow("Unauthorized");
    expect(prisma.comment.findMany).not.toHaveBeenCalled();
  });
});

/**
 * Tests for fetching every comment on a post
 *
 * Checks:
 *    Returns an empty array when the post has no comments
 *    Queries by post slug, newest first
 *    Returns replies alongside top-level comments
 *    Rejects when the database query fails
 */
describe("getCommentsOnPost", () => {
  it("returns an empty array when no post is found", async () => {
    prisma.comment.findMany.mockResolvedValueOnce(new Array<Comment>());

    const comments = await getCommentsOnPost("alien-romulus");

    expect(comments).toStrictEqual(new Array<Comment>());
  });

  it("queries by post slug, newest first", async () => {
    const comments = [{ id: "comment-1" }] as Comment[];
    prisma.comment.findMany.mockResolvedValueOnce(comments);

    const result = await getCommentsOnPost("alien-romulus");

    expect(result).toBe(comments);
    expect(prisma.comment.findMany).toHaveBeenCalledWith({
      where: { postSlug: "alien-romulus" },
      orderBy: { createdAt: "desc" },
    });
  });

  it("returns replies alongside top-level comments", async () => {
    const comments = [
      { id: "comment-1", repliesToId: null },
      { id: "reply-1", repliesToId: "comment-1" },
    ] as Comment[];
    prisma.comment.findMany.mockResolvedValueOnce(comments);

    const result = await getCommentsOnPost("alien-romulus");

    expect(result).toHaveLength(2);
  });

  it("rejects when the database query fails", async () => {
    prisma.comment.findMany.mockRejectedValueOnce(new Error("Database error"));

    await expect(getCommentsOnPost("alien-romulus")).rejects.toThrow(
      "Database error",
    );
  });
});

/**
 * Tests for fetching top-level comments with their replies
 *
 * Checks:
 *    Queries top-level comments by slug and includes their replies
 *    Passes the nested replies through
 *    Returns an empty array when there are no comments
 *    Rejects when the database query fails
 */
describe("getRepliesOnPost", () => {
  it("queries top-level comments by slug and includes their replies", async () => {
    prisma.comment.findMany.mockResolvedValueOnce([]);

    await getRepliesOnPost("alien-romulus");

    expect(prisma.comment.findMany).toHaveBeenCalledWith({
      where: { postSlug: "alien-romulus", repliesToId: null },
      include: { repliesReceived: { orderBy: { createdAt: "desc" } } },
      orderBy: { createdAt: "desc" },
    });
  });

  it("returns each comment with its replies attached", async () => {
    const comments = [
      { id: "comment-1", repliesReceived: [{ id: "reply-1" }] },
      { id: "comment-2", repliesReceived: [] },
    ];
    prisma.comment.findMany.mockResolvedValueOnce(comments as never);

    const result = await getRepliesOnPost("alien-romulus");

    expect(result[0].repliesReceived).toHaveLength(1);
    expect(result[1].repliesReceived).toStrictEqual([]);
  });

  it("returns an empty array when the post has no comments", async () => {
    prisma.comment.findMany.mockResolvedValueOnce([]);

    const result = await getRepliesOnPost("alien-romulus");

    expect(result).toStrictEqual([]);
  });

  it("rejects when the database query fails", async () => {
    prisma.comment.findMany.mockRejectedValueOnce(new Error("Database error"));

    await expect(getRepliesOnPost("alien-romulus")).rejects.toThrow(
      "Database error",
    );
  });
});

/**
 * Tests for counting comments posted within the last day, month or year
 *
 * Checks:
 *    The query window is correct for each period (day, month, year)
 *    The count from the database is returned, including zero
 *    A month-end date clamps to the end of the previous month
 *    Rejects when the database query fails
 */
describe("getAmountOfComments", () => {
  const now = new Date("2026-07-15T12:00:00.000Z");

  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(now);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it.each([
    ["day", "2026-07-14T12:00:00.000Z"],
    ["month", "2026-06-15T12:00:00.000Z"],
    ["year", "2025-07-15T12:00:00.000Z"],
  ] as const)("counts comments from the last %s", async (period, start) => {
    prisma.comment.count.mockResolvedValueOnce(3);

    const result = await getAmountOfComments(period);

    expect(result).toBe(3);
    expect(prisma.comment.count).toHaveBeenCalledWith({
      where: { createdAt: { lte: now, gte: new Date(start) } },
    });
  });

  it("returns 0 when there are no comments in the period", async () => {
    prisma.comment.count.mockResolvedValueOnce(0);

    const result = await getAmountOfComments("day");

    expect(result).toBe(0);
  });

  it("clamps to the end of the previous month for month-end dates", async () => {
    vi.setSystemTime(new Date("2026-05-31T12:00:00.000Z"));
    prisma.comment.count.mockResolvedValueOnce(1);

    await getAmountOfComments("month");

    expect(prisma.comment.count).toHaveBeenCalledWith({
      where: {
        createdAt: {
          lte: new Date("2026-05-31T12:00:00.000Z"),
          gte: new Date("2026-04-30T12:00:00.000Z"),
        },
      },
    });
  });

  it("rejects when the database query fails", async () => {
    prisma.comment.count.mockRejectedValueOnce(new Error("Database error"));

    await expect(getAmountOfComments("year")).rejects.toThrow("Database error");
  });
});
