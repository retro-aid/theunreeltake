import {Prisma} from "@/generated/prisma/client";
import prisma from "@/lib/prisma";


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

  } catch(e) {
    console.error(e);
  }
}