import "server-only";
import prisma from "@/lib/prisma";
import {headers} from "next/headers";
import { auth } from "@/lib/auth";
import type { PostEditDTO, PostDTO } from "./dto/posts";

export async function savePost(
  id: string,
  title: string,
  slug: string,
  content: string,
  published: boolean,
  posterUrl: string | null,
  mediaTagId: number
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
          create: {
            tag: { connect: { id: mediaTagId }}
          }
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
    mediaTagId: number,
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
      }
    });

    await prisma.tagsOnPost.create({
      data: {
        tagId: formData.mediaTagId,
        postId: result.id
      }
    })

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
        include: {
          tag: true,
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
    mediaTagId: data.tags[0]?.tag.id ?? 0,
  };
}

export async function getAllPosts({
  page = 1,
  limit = 10,
  search = "",
}: {
  page?: number;
  limit?: number;
  search?: string;
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
      ...(session.user.role?.toLowerCase() !== "admin" && {
        authorId: session.user.id,
      }),
    };
    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        orderBy: {
          updatedAt: "desc",
        },
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