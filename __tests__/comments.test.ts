import { describe, expect, it, vi } from "vitest";
import prisma from "@/lib/__mocks__/prisma";
import { getCommentsOnPost } from "@/lib/dal/dto/comments";
import { Comment } from "@/generated/prisma/client";

vi.mock(import("server-only"), () => {
  return {};
});

vi.mock(import("@/lib/prisma"));

describe("getCommentsOnPost", () => {
  it("returns an empty array when no post is found", async () => {
    prisma.comment.findMany.mockResolvedValueOnce(new Array<Comment>());

    const comments = await getCommentsOnPost("alien-romulus");

    expect(comments).toStrictEqual(new Array<Comment>());
  });
});
