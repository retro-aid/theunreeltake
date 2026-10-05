import "server-only";
import prisma from "@/lib/prisma";

export async function getRecentUserReviews(limit: number = 5) {
  try {
    const posts = await prisma.post.findMany({
      take: limit,
      where: {
        published: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        title: true,
        slug: true,
        posterUrl: true,
        createdAt: true,
        author: {
          select: {
            name: true,
          },
        },
      },
    });

    return { success: true, data: posts };
  } catch (error) {
    console.error("Prisma error fetching recent reviews:", error);
    return { success: false, data: [] };
  }
}