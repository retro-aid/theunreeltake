import { describe, expect, it, vi, beforeEach } from "vitest";
import prisma from "@/lib/__mocks__/prisma";
import {
  getAdminPosts,
  updatePost,
  createPost,
  getPost,
} from "@/lib/dal/dto/posts";
import {
  deletePost,
  getAllPosts,
  getPostForEdit,
  togglePublished,
} from "@/lib/dal/posts";
import {
  getPostAction,
  createPostAction,
  deletePostAction,
  getPostForEditAction,
  getAllPostsAction,
  togglePublishedAction,
  updatePostAction,
  getAdminPostsAction,
} from "@/lib/actions/post-actions";
import { getCurrentSession } from "@/lib/dal/utils";

vi.mock(import("server-only"), () => {
  return {};
});

vi.mock(import("@/lib/prisma"));

//Checks user's login
vi.mock("@/lib/dal/utils", () => ({ getCurrentSession: vi.fn() }));
function mockSession(user: Record<string, unknown>) {
  vi.mocked(getCurrentSession).mockResolvedValue({ user } as any);
}
function mockUnauthorized() {
  vi.mocked(getCurrentSession).mockRejectedValue(new Error("Unauthorized"));
}

//Mock-Up Post
const now = new Date("2026-01-01T00:00:00Z");
const postDummy = {
  id: "idDummy",
  title: "TitleTest",
  slug: "slug-test",
  htmlContent: "content",
  posterUrl: "picture.png",
  published: true,
  authorId: "authorID",
  createdAt: now,
  updatedAt: now,
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, "error").mockImplementation(() => {});
});

/**
 * Test delete post action
 * Location Path: src/lib/dal/posts.ts
 *
 * Test Cases:
 *  -Successfully deletes a post
 *  -Returns error when prisma is down
 *  -Passes empty string
 *  -Returns error when Post does not exist
 *
 */
describe("deletePost", () => {
  it("Successfully deleted a post", async () => {
    prisma.post.delete.mockResolvedValue(postDummy as any);
    const result = await deletePost("idDummy");
    expect(prisma.post.delete).toHaveBeenCalledWith({
      where: { id: "idDummy" },
    });
    expect(result).toEqual({ error: null, success: true });
  });

  it("Returns error when Prisma throws", async () => {
    prisma.post.delete.mockRejectedValue(new Error("Prisma Down"));
    const result = await deletePost("idDummy");
    expect(result).toEqual({ error: "Failed to delete post", success: false });
  });

  it("Passes an empty id straight through and calls delete once", async () => {
    prisma.post.delete.mockRejectedValue(new Error("Invalid Id"));
    const result = await deletePost("");
    expect(prisma.post.delete).toHaveBeenCalledOnce();
    expect(prisma.post.delete).toHaveBeenCalledWith({ where: { id: "" } });
    expect(result.success).toBe(false);
  });

  it("Returns error when Post does not exist", async () => {
    prisma.post.delete.mockRejectedValue(new Error("Post not found"));
    await expect(deletePost("missing")).resolves.toEqual({
      error: "Failed to delete post",
      success: false,
    });
  });
});

/**
 * Test getPostForEdit
 * Location Path:/src/lib/dal/posts.ts
 *
 * Test Cases:
 *  -Post goes to edit DTO
 *  -When Post does not exist, return null
 *  -Load Edit Post even without tags
 *
 */
describe("getPostForEdit", () => {
  it("Maps the Post to an edit DTO with string tag ids", async () => {
    prisma.post.findUnique.mockResolvedValue({
      ...postDummy,
      tags: [{ tagId: "Tag1" }, { tagId: "Tag2" }],
    } as any);

    const result = await getPostForEdit("idDummy");
    expect(prisma.post.findUnique).toHaveBeenCalledWith({
      where: { id: "idDummy" },
      include: { tags: { select: { tagId: true } } },
    });
    expect(result).toEqual({
      id: "idDummy",
      title: "TitleTest",
      slug: "slug-test",
      htmlContent: "content",
      posterUrl: "picture.png",
      published: true,
      mediaTagId: ["Tag1", "Tag2"],
    });
  });

  it("Returns null when post is not found", async () => {
    prisma.post.findUnique.mockResolvedValue(null);
    expect(await getPostForEdit("missing")).toBeNull();
  });

  it("Returns an empty mediaTagId array when post has no tags", async () => {
    prisma.post.findUnique.mockResolvedValue({
      ...postDummy,
      tags: [],
    } as any);

    const result = await getPostForEdit("idDummy");
    expect(result?.mediaTagId).toEqual([]);
  });
});

/**
 * Publish/Unpublish a post
 * Location Path:/src/lib/dal/posts.ts
 *
 * Test Cases:
 *  -Unpublish a published post
 *  -Publish a draft post
 *  -'Post Not Found' error doesn't update Post's boolean published
 */
describe("togglePublished", () => {
  it("unpublishes a published post", async () => {
    prisma.post.findUnique.mockResolvedValue({ published: true } as any);
    prisma.post.update.mockResolvedValue({} as any);

    const result = await togglePublished("idDummy");
    expect(prisma.post.update).toHaveBeenCalledWith({
      where: { id: "idDummy" },
      data: { published: false },
    });
    expect(result).toEqual({ success: true, error: null });
  });

  it("publishes a draft post", async () => {
    prisma.post.findUnique.mockResolvedValue({ published: false } as any);
    prisma.post.update.mockResolvedValue({} as any);

    const result = await togglePublished("idDummy");

    expect(prisma.post.update).toHaveBeenCalledWith({
      where: { id: "idDummy" },
      data: { published: true },
    });
    expect(result.success).toBe(true);
  });

  it("returns Post Not Found and does not update when post is missing", async () => {
    prisma.post.findUnique.mockResolvedValue(null);
    const result = await togglePublished("missing");

    expect(result).toEqual({ success: false, error: "Post not found" });
    expect(prisma.post.update).not.toHaveBeenCalled();
  });
});

/**
 * Uses test cases for the getAllPosts function
 * Tested using the postDummy mock-up
 * Location Path:/src/lib/dal/posts.ts
 *
 * Test Cases:
 *  -Test error for when user is not logged in
 *  -Returns correct DTOs and total posts for admin
 *  -Tests the Pagination
 *      -Limit of items per page
 *      -Which page of items user wants
 */
describe("getAllPosts", () => {
  beforeEach(() => {
    prisma.post.findMany.mockResolvedValue([postDummy] as any);
    prisma.post.count.mockResolvedValue(1);
  });

  it("Returns an error if user is not logged in", async () => {
    mockUnauthorized();
    const result = await getAllPosts({});
    expect(result).toEqual({
      success: false,
      data: [],
      total: 0,
      error: "You must be logged in.",
    });
    expect(prisma.post.findMany).not.toHaveBeenCalled();
  });

  it("Returns DTOs and total for admin", async () => {
    mockSession({ id: "User1", role: "admin" });
    const result = await getAllPosts({});
    expect(result.success).toBe(true);
    expect(result.total).toBe(1);
    expect(result.data).toEqual([
      {
        id: "idDummy",
        title: "TitleTest",
        slug: "slug-test",
        posterUrl: "picture.png",
        published: true,
        authorId: "authorID",
        createdAt: now,
        updatedAt: now,
      },
    ]);
    expect(result.data[0]).not.toHaveProperty("htmlContent");
  });

  it.each([
    { name: "defaults (page 1, limit 10)", input: {}, skip: 0, take: 10 },
    {
      name: "page 3, limit 5",
      input: { page: 3, limit: 5 },
      skip: 10,
      take: 5,
    },
  ])("paginates correctly with $name", async ({ input, skip, take }) => {
    mockSession({ id: "User1", role: "admin" });

    await getAllPosts(input);

    expect(prisma.post.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip, take }),
    );
  });
});
