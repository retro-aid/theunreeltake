import "server-only";
import prisma from "@/lib/prisma"
import {AllowedTagType} from "@/lib/constants";

export async function updateTag(
    id: number,
    displayName: string,
    type: string
) {
    return prisma.tag.update({
        where: {id}, 
        data: {displayName: displayName, type: type}
    });
}export type TagDTO = {
  id: number;
  displayName: string;
};

export async function getAllTags(): Promise<TagDTO[]> {

  return prisma.tag.findMany({
    where: {
      type: AllowedTagType.Media
    },
    omit: {
      type: true
    }
  });
}