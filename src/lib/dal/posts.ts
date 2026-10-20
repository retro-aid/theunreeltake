import "server-only";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import type { PostEditDTO, PostDTO } from "./dto/posts";
import { Prisma } from "@/generated/prisma/client";
import { getCurrentSession } from "@/lib/dal/utils";

/**
 * Updates the author ID of a post.
 * Restricted to admin sessions.
 * @param id - The ID of the post to update.
 * @param newAuthorId - The ID of the new author.
 * @returns Status object indicating success or error.
 */
export async function updatePostAuthor(id: string, newAuthorId: string) {
  try {
    const session = await getCurrentSession();

    if (session?.user?.role?.toLowerCase() !== "admin") {
      return { success: false, error: "Unauthorized" };
    }

    await prisma.post.update({
      where: { id },
      data: { authorId: newAuthorId },
    });

    return { success: true, error: null };
  } catch (error) {
    console.error("Failed to update post author:", error);
    return { success: false, error: "Failed to update author" };
  }
}

/**
 * Fetches all users for selection.
 * @returns An array of users.
 */
export async function getAllUsers() {
  return prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
    },
    orderBy: { name: "asc" },
  });
}

export async function deletePost(id: string) {
  try {
    await prisma.post.delete({
      where: {
        id: id,
      },
    });

    return { error: null, success: true };
  } catch (error) {
    return { error: "Failed to delete post", success: false };
  }
}

export async function getPostForEdit(id: string): Promise<PostEditDTO | null> {
  const data = await prisma.post.findUnique({
    where: { id },
    include: {
      tags: {
        select: {
          tagId: true,
        },
      },
    },
  });

  if (!data) {
    return null;
  }

  return {
    id: data.id,
    title: data.title,
    slug: data.slug,
    htmlContent: data.htmlContent,
    posterUrl: data.posterUrl,
    published: data.published,
    mediaTagId: data.tags.map((tag) => String(tag.tagId)),
  };
}
const POST_ORDER_BY: Record<string, Prisma.PostOrderByWithRelationInput> = {
  "title-asc": { title: "asc" },
  "title-desc": { title: "desc" },
  "createdAt-asc": { createdAt: "asc" },
  "createdAt-desc": { createdAt: "desc" },
};
export async function getAllPosts({
  page = 1,
  limit = 10,
  search = "",
  filter = "",
  sort = "",
}: {
  page?: number;
  limit?: number;
  search?: string;
  filter?: string;
  sort?: string;
}) {
  try {
    const session = await getCurrentSession();

    const where = {
      title: {
        contains: search,
        mode: "insensitive" as const,
      },
      published:
        filter === "published" ? true : filter === "draft" ? false : undefined,
      ...(session.user.role?.toLowerCase() !== "admin" && {
        authorId: session.user.id,
      }),
    };
    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        orderBy: POST_ORDER_BY[sort] ?? { updatedAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          author: {
            select: { name: true },
          },
          tags: {
            select: { tagId: true },
          },
        },
      }),
      prisma.post.count({
        where,
      }),
    ]);

    const data: PostDTO[] = posts.map((post) => ({
      id: post.id,
      title: post.title,
      slug: post.slug,
      posterUrl: post.posterUrl,
      published: post.published,
      authorId: post.authorId,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      authorName: post.author.name,
      tagCount: post.tags.length,
      views: post.views,
    }));

    return {
      success: true,
      data,
      total,
    };
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return {
        success: false,
        data: [],
        total: 0,
        error: "You must be logged in.",
      };
    }

    console.error("Failed to fetch posts:", error);

    return {
      success: false,
      data: [],
      total: 0,
    };
  }
}

export async function togglePublished(id: string) {
  try {
    const post = await prisma.post.findUnique({
      where: { id },
      select: { published: true },
    });

    if (!post) {
      return {
        success: false,
        error: "Post not found",
      };
    }

    await prisma.post.update({
      where: { id },
      data: {
        published: !post.published,
      },
    });

    return {
      success: true,
      error: null,
    };
  } catch (error) {
    console.error("Failed to post publication:", error);
    return {
      success: false,
      error: "Failed to update post",
    };
  }
}
