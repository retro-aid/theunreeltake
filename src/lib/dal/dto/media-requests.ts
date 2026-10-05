import "server-only";
import prisma from "@/lib/prisma";
import { Request } from "@/generated/prisma/client";

type MediaRequestPrefillDTO = Pick<Request, "id" | "type" | "title">;

export async function getMediaRequest(id: string) {
  return prisma.request.findUnique({
    where: { id: id },
    select: { id: true, type: true, title: true },
  }) as Promise<MediaRequestPrefillDTO>;
}

export async function getPendingRequestCount() {
  return prisma.request.count({
    where: {
      status: "pending",
    },
  });
}

export async function getTotalViews(days: number = 30) {
  try {
    const totalViews = await prisma.post.aggregate({
      _sum: { views: true },
    });

    return { success: true, total: totalViews._sum.views ?? 0 };
  } catch (error) {
    console.error("Failed to fetch total views:", error);
    return { success: false, total: 0 };
  }
}