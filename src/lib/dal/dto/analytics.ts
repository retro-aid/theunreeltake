import "server-only";
import prisma from "@/lib/prisma";

/**
 * Gets the total number of views across all posts
 *
 * @returns The total number of views or 0 if it fails
 */
export async function getTotalViews() {
  try {
    const totalViews = await prisma.post.aggregate({
      _sum: { views: true },
    });

    return totalViews._sum.views ?? 0;
  } catch (error) {
    console.error("Failed to fetch total views:", error);
    return 0;
  }
}

/**
 * Gets the total number of users currently registered
 *
 * @returns The count of users that exist in the database, or 0 if the database query fails
 */
export async function getTotalActiveUsers(): Promise<number> {
  try {
    return await prisma.user.count();
  } catch (error) {
    console.error(error);
    return 0;
  }
}

/**
 * Fetches the most recent published user reviews.
 *
 * @param limit - limits the number of reviews to return
 *
 * @returns recent reviews or empty array if it fails
 */
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
