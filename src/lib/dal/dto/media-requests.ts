import "server-only";
import prisma from "@/lib/prisma";
import { Request } from "@/generated/prisma/client";

type MediaRequestPrefillDTO = Pick<Request, "id" | "type" | "title">;

export async function getMediaRequest(id: string) {

  return prisma.request.findUnique({
    where: { id: id },
    select: { id: true, type: true, title: true }
  }) as Promise<MediaRequestPrefillDTO>;
}