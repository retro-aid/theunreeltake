import "server-only";
import prisma from "@/lib/prisma";

export async function getTotalViews(days: number = 30) {
  try {
    const totalViews = await prisma.post.aggregate({
      _sum: { views: true },
    });

    return totalViews._sum.views ?? 0
  } catch (error) {
    console.error("Failed to fetch total views:", error);
    return 0;
  }
}

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