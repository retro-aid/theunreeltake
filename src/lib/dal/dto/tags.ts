import "server-only";
import prisma from "@/lib/prisma";
import { AllowedTagType } from "@/lib/constants";
import type { CreateTagForm } from "@/lib/schemas/tag-schemas";

export async function updateTag(id: number, displayName: string, type: string) {
  return prisma.tag.update({
    where: { id },
    data: { displayName: displayName, type: type },
  });
}
export type TagDTO = {
  id: number;
  displayName: string;
};

export async function getAllTags(): Promise<TagDTO[]> {
  return prisma.tag.findMany({
    where: {
      type: AllowedTagType.Media,
    },
    omit: {
      type: true,
    },
  });
}

/**
 * Retrieves every tag in the database, including its type.
 * Intended for the admin tag management table.
 *
 * @returns A promise resolving to all Tag records.
 */
export async function getAdminTags() {
  return prisma.tag.findMany();
}

/**
 * Creates a new tag.
 *
 * @param tag - The validated form values: name (display name) and type.
 * @returns A promise resolving to the created Tag record.
 * @throws If the database write fails.
 */
export async function createTag(tag: CreateTagForm) {
  return prisma.tag.create({
    data: { displayName: tag.name, type: tag.type },
  });
}

/**
 * Deletes a tag by its ID.
 *
 * @param id - The ID of the tag to delete.
 * @returns A promise resolving to the deleted Tag record.
 * @throws If no tag with that ID exists or the delete fails.
 */
export async function deleteTag(id: number) {
  return prisma.tag.delete({ where: { id } });
}
