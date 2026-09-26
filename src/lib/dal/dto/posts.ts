import 'server-only';
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
  sort = ""
}: {
  page?: number,
  limit?: number,
  search?: string,
  filter?: string,
  sort?: string
}) {

  try {

    const session = await getCurrentSession();

    const where: Prisma.PostWhereInput = {
      authorId: session.user.id,
      title: { contains: search, mode: "insensitive" },
      published: filter ? filter === "published" : undefined
    };

    const [data, total] = await Promise.all([
      prisma.post.findMany({
        where,
        orderBy: POST_ORDER_BY[sort] ?? { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.post.count({ where })
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
      select: { tagId: true }
    }
  }
}>;


export type UpdatePostArgs = Omit<PostWithTags, "authorId" | "createdAt" | "views" | "updatedAt">;


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
          create: post.tags
        }
      }
    });

  } catch (e) {
    console.error(e);
  }
}