import "server-only";
import prisma from "@/lib/prisma";
import {headers} from "next/headers";
import { auth } from "@/lib/auth";
import type { PostEditDTO, PostDTO } from "./dto/posts";
import { Prisma } from "@/generated/prisma/client";

export async function savePost(
  id: string,
  title: string,
  slug: string,
  content: string,
  published: boolean,
  posterUrl: string | null,
  mediaTagId: string[]
)
{
  try
  {
    await prisma.tagsOnPost.deleteMany({
      where: {
        postId: id
      }
    });

    await prisma.post.update({
      where: {
        id: id,
      },
      data: {
        title: title,
        slug: slug,
        posterUrl: posterUrl,
        htmlContent: content,
        published: published,
        tags: {
          create: mediaTagId.map((tagId) => ({
          tagId: Number(tagId),
          })),
        }
      }
    });

    return { error: null, success: true};
  } catch (error) {
    return { error: "Failed to save post", success: false };
  }
}

export async function createNewPost(
  formData: {
    title: string,
    slug: string,
    mediaTagId: string[],
    pageContent: string,
    published: boolean,
    posterUrl: string | null
  }
){
  try {

    const session = await auth.api.getSession({
      headers: await headers()
    });

    if(!session || !session.user) {
      return { error: "You must be logged in to create a post.", success: false };
    }
    const result = await prisma.post.create({
      data: {
        title: formData.title,
        slug: formData.slug,
        htmlContent: formData.pageContent,
        posterUrl: formData.posterUrl,
        published: formData.published,
        authorId: session.user.id,

        tags: {
          create: formData.mediaTagId.map((tagId) => ({
            tagId: Number(tagId),
          })),
        },
      },
    });

    return { error: null, success: true };
  } catch (error) {
    console.error("PRISMA DATABASE ERROR:", error);
    return { error: "Failed to save post", success: false };
  }
}

export async function deletePost(id:string)
{
  try
  {
    await prisma.post.delete({
      where:{
        id: id,
      }
    });

    return { error: null, success: true};
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
  sort = ""
}: {
  page?: number,
  limit?: number,
  search?: string,
  filter?: string,
  sort?: string
}) {
  try {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

     if (!session?.user) {
      return {
        success: false,
        data: [],
        total: 0,
        error: "You must be logged in.",
      };
    }
    const where = {
      title: {
        contains: search,
        mode: "insensitive" as const,
      },
      published:
        filter === "published"
          ? true
          : filter === "draft"
            ? false
            : undefined,
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
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
    }));

    return {
      success: true,
      data,
      total,
    };
  } catch (error) {
    console.error("Failed to fetch posts:", error);

    return {
      success: false,
      data: [],
      total: 0,
    };
  }
}

export async function togglePublished(id:string)
{
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