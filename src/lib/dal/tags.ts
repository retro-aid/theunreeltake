import "server-only";
import {AllowedTagType} from "@/lib/constants";
import prisma from "@/lib/prisma";
import type { TagDTO } from "@/lib/dal/dto/tags";

export async function getAllTags(): Promise<{
  data: TagDTO[]; success : boolean}> {

  try {
    const tags = await prisma.tag.findMany({
      where: {
        type: AllowedTagType.Media,
      },
    });

  return {
    success: true,
      data: tags.map((tag) => ({
        id: tag.id,
        displayName: tag.displayName,
      })),
    };

  } catch (e) {
    console.error("Failed to fetch tags:", e);
    return {
      success: false,
      data: []
    };
  }
}