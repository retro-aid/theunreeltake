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

// Counts the number of requests with the status pending. Returns the total
export async function getPendingRequestCount() {
  return prisma.request.count({
    where: {
      status: "pending",
    },
  });
}
