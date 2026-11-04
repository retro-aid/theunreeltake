import { beforeEach, describe, expect, it, vi } from "vitest";
import prisma from "@/lib/__mocks__/prisma";
import { getCurrentSession } from "@/lib/dal/utils";
import * as events from "@/lib/dal/dto/email/events";
import { createPost, updatePost } from "@/lib/dal/dto/posts";
import { togglePublished } from "@/lib/dal/posts";
import { createReply } from "@/lib/dal/dto/comments";
import { submitRequestForm } from "@/lib/dal/dto/media-requests";

vi.mock(import("server-only"), () => {
  return {};
});
vi.mock(import("@/lib/prisma"));
vi.mock("next/headers", () => ({ headers: vi.fn() }));
vi.mock("@/lib/dal/utils", () => ({
  getCurrentSession: vi.fn(),
  requireAdmin: vi.fn(),
}));
vi.mock("@/lib/dal/dto/email/events", () => ({
  postPublished: vi.fn(),
  commentReplied: vi.fn(),
  requestSubmitted: vi.fn(),
}));
vi.mock("resend", () => ({ Resend: class {} }));

const admin = {
  user: { id: "user-1", name: "Admin", email: "admin@example.com" },
};

beforeEach(() => {
  vi.resetAllMocks();
  vi.spyOn(console, "error").mockImplementation(() => {});
  vi.mocked(getCurrentSession).mockResolvedValue(admin as never);
});

/**
 * Tests that creating a post triggers the new post event
 *
 * Checks:
 *    Sends the event when the post is published
 *    Doesn't send it for a draft
 *    Doesn't send it when the post fails to save
 */
describe("createPost", () => {
  const post = {
    title: "Alien: Romulus",
    slug: "alien-romulus",
    htmlContent: "<p>Review</p>",
    posterUrl: null,
    imageUrls: [],
    published: true,
    tags: [],
  };

  it("sends the event when the post is published", async () => {
    await createPost(post as never);

    expect(events.postPublished).toHaveBeenCalledWith(post);
  });

  it("doesn't send it for a draft", async () => {
    await createPost({ ...post, published: false } as never);

    expect(events.postPublished).not.toHaveBeenCalled();
  });

  it("doesn't send it when the post fails to save", async () => {
    prisma.post.create.mockRejectedValueOnce(new Error("Database error"));

    await createPost(post as never);

    expect(events.postPublished).not.toHaveBeenCalled();
  });
});

/**
 * Tests that publishing a draft from the editor triggers the new post event
 *
 * Checks:
 *    Sends the event when a draft is published
 *    Doesn't send it when an already-published post is edited
 *    Doesn't send it when a post is unpublished or saved as a draft
 *    Doesn't send it when the post fails to save
 */
describe("updatePost", () => {
  const post = {
    id: "post-1",
    title: "Alien: Romulus",
    slug: "alien-romulus",
    htmlContent: "<p>Review</p>",
    posterUrl: null,
    imageUrls: [],
    published: true,
    tags: [],
  };

  it("sends the event when a draft is published", async () => {
    prisma.post.findUnique.mockResolvedValueOnce({ published: false } as never);

    await updatePost(post as never);

    expect(events.postPublished).toHaveBeenCalledWith(post);
  });

  it("doesn't send it when an already-published post is edited", async () => {
    prisma.post.findUnique.mockResolvedValueOnce({ published: true } as never);

    await updatePost(post as never);

    expect(events.postPublished).not.toHaveBeenCalled();
  });

  it("doesn't send it when a post is unpublished or saved as a draft", async () => {
    prisma.post.findUnique.mockResolvedValueOnce({ published: true } as never);

    await updatePost({ ...post, published: false } as never);

    expect(events.postPublished).not.toHaveBeenCalled();
  });

  it("doesn't send it when the post fails to save", async () => {
    prisma.post.findUnique.mockResolvedValueOnce({ published: false } as never);
    prisma.post.update.mockRejectedValueOnce(new Error("Database error"));

    await updatePost(post as never);

    expect(events.postPublished).not.toHaveBeenCalled();
  });
});

/**
 * Tests that the publish toggle on the posts list triggers the new post event
 *
 * Checks:
 *    Sends the event when a draft is toggled to published
 *    Doesn't send it when a published post is toggled to a draft
 */
describe("togglePublished", () => {
  const draft = {
    published: false,
    title: "Alien: Romulus",
    slug: "alien-romulus",
  };

  it("sends the event when a draft is toggled to published", async () => {
    prisma.post.findUnique.mockResolvedValueOnce(draft as never);

    await togglePublished("post-1");

    expect(events.postPublished).toHaveBeenCalledWith(draft);
  });

  it("doesn't send it when a published post is toggled to a draft", async () => {
    prisma.post.findUnique.mockResolvedValueOnce({
      ...draft,
      published: true,
    } as never);

    await togglePublished("post-1");

    expect(events.postPublished).not.toHaveBeenCalled();
  });
});

/**
 * Tests that replying to a comment triggers the reply event
 *
 * Checks:
 *    Sends the event to the original commenter when they left an email
 *    Doesn't send it when the commenter left no email
 *    Doesn't send it when you reply to your own comment
 */
describe("createReply", () => {
  const parent = {
    id: "parent-1",
    postId: "post-1",
    postSlug: "alien-romulus",
    repliesToId: null,
    email: "fan@example.com",
    username: "Sam",
    post: { title: "Alien: Romulus" },
  };

  beforeEach(() => {
    prisma.comment.create.mockResolvedValue({ id: "reply-1" } as never);
  });

  it("sends the event to the original commenter when they left an email", async () => {
    prisma.comment.findUniqueOrThrow.mockResolvedValueOnce(parent as never);

    await createReply("parent-1", "Thanks for reading!");

    expect(events.commentReplied).toHaveBeenCalledWith({
      email: "fan@example.com",
      name: "Sam",
      postTitle: "Alien: Romulus",
      postSlug: "alien-romulus",
      message: "Thanks for reading!",
    });
  });

  it("doesn't send it when the commenter left no email", async () => {
    prisma.comment.findUniqueOrThrow.mockResolvedValueOnce({
      ...parent,
      email: null,
    } as never);

    await createReply("parent-1", "Thanks for reading!");

    expect(events.commentReplied).not.toHaveBeenCalled();
  });

  it("doesn't send it when you reply to your own comment", async () => {
    prisma.comment.findUniqueOrThrow.mockResolvedValueOnce({
      ...parent,
      email: admin.user.email,
    } as never);

    await createReply("parent-1", "Adding to my comment");

    expect(events.commentReplied).not.toHaveBeenCalled();
  });
});

/**
 * Tests that submitting a request triggers the thank-you event
 *
 * Checks:
 *    Sends the event to the person who made the request
 *    Doesn't send it when the request fails to save
 */
describe("submitRequestForm", () => {
  const form = {
    email: "fan@example.com",
    title: "Dune",
    mediaType: "Movie",
    name: " Sam ",
    message: "Please review this",
  };

  it("sends the event to the person who made the request", async () => {
    await submitRequestForm(form as never);

    expect(events.requestSubmitted).toHaveBeenCalledWith({
      email: "fan@example.com",
      name: "Sam",
      title: "Dune",
    });
  });

  it("doesn't send it when the request fails to save", async () => {
    prisma.request.create.mockRejectedValueOnce(new Error("Database error"));

    const result = await submitRequestForm(form as never);

    expect(result.success).toBe(false);
    expect(events.requestSubmitted).not.toHaveBeenCalled();
  });
});
