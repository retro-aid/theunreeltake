import "server-only";
import { Prisma } from "@/generated/prisma/client";
import prisma from "@/lib/prisma";
import { getCurrentSession } from "@/lib/dal/utils";

const POST_ORDER_BY: Record<string, Prisma.PostOrderByWithRelationInput> = {
  "title-asc": { title: "asc" },
  "title-desc": { title: "desc" },
  "createdAt-asc": { createdAt: "asc" },
  "createdAt-desc": { createdAt: "desc" },
};

export async function getAdminPosts({
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

    const where: Prisma.PostWhereInput = {
      authorId: session.user.id,
      title: { contains: search, mode: "insensitive" },
      published: filter ? filter === "published" : undefined,
    };

    const [data, total] = await Promise.all([
      prisma.post.findMany({
        where,
        orderBy: POST_ORDER_BY[sort] ?? { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.post.count({ where }),
    ]);

    return { success: true, data, total };
  } catch (e) {
    console.error(e);
    return { success: false, data: [], total: 0 };
  }
}

type PostWithTags = Prisma.PostGetPayload<{
  include: {
    tags: {
      select: { tagId: true };
    };
  };
}>;

export type GetPostEditDTO = PostWithTags;
export type CreatePostArgs = Omit<
  PostWithTags,
  "id" | "createdAt" | "updatedAt" | "views" | "authorId"
>;
export type UpdatePostArgs = Omit<
  PostWithTags,
  "authorId" | "createdAt" | "views" | "updatedAt"
>;

export async function updatePost(post: UpdatePostArgs) {
  try {
    await prisma.post.update({
      where: { id: post.id },
      data: {
        title: post.title,
        slug: post.slug,
        posterUrl: post.posterUrl,
        htmlContent: post.htmlContent,
        imageUrls: post.imageUrls,
        published: post.published,
        updatedAt: new Date(),
        tags: {
          deleteMany: {},
          create: post.tags,
        },
      },
    });
  } catch (e) {
    console.error(e);
  }
}

export async function createPost(post: CreatePostArgs) {
  const session = await getCurrentSession();

  if (!session || !session.user) {
    // TODO Replace with better error handling
    console.error("Forbidden");
    return;
  }

  try {
    await prisma.post.create({
      data: {
        title: post.title,
        slug: post.slug,
        htmlContent: post.htmlContent,
        posterUrl: post.posterUrl,
        imageUrls: post.imageUrls,
        published: post.published,
        authorId: session.user.id,
        updatedAt: new Date(),
        tags: {
          createMany: { data: post.tags },
        },
      },
    });
  } catch (e) {
    console.error(e);
  }
}

export async function getPost(id: string): Promise<GetPostEditDTO | null> {
  try {
    return prisma.post.findUnique({
      where: { id: id },
      include: {
        tags: true,
      },
    });
  } catch (e) {
    console.error(e);
    return null;
  }
}

export type PostDTO = {
  id: string;
  title: string;
  slug: string;
  posterUrl: string | null;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type PostEditDTO = {
  id: string;
  title: string;
  slug: string;
  htmlContent: string;
  posterUrl: string | null;
  published: boolean;
  mediaTagId: string[];
};
