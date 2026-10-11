import "server-only";
import prisma from "@/lib/prisma";
import { AllowedTagType } from "@/lib/constants";
import {
  CreateTagSchema,
  TagIdSchema,
  type CreateTagForm,
} from "@/lib/schemas/tag-schemas";

/**
 * Updates a tag's display name and type.
 *
 * @remarks
 * Uses the same rules as creating a tag, so a tag can't be updated into
 * something that couldn't have been created.
 *
 * @param id - The ID of the tag to update.
 * @param displayName - The new display name.
 * @param type - The new tag type.
 * @returns A promise resolving to the updated Tag record.
 * @throws If the input is invalid, the tag doesn't exist, or the update fails.
 */
export async function updateTag(id: number, displayName: string, type: string) {
  const tagId = TagIdSchema.parse(id);
  const tag = CreateTagSchema.parse({ name: displayName, type });

  return prisma.tag.update({
    where: { id: tagId },
    data: { displayName: tag.name, type: tag.type },
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
 * @throws If the input is invalid or the database write fails.
 */
export async function createTag(tag: CreateTagForm) {
  const parsed = CreateTagSchema.parse(tag);

  return prisma.tag.create({
    data: { displayName: parsed.name, type: parsed.type },
  });
}

/**
 * Deletes a tag by its ID.
 *
 * @param id - The ID of the tag to delete.
 * @returns A promise resolving to the deleted Tag record.
 * @throws If the ID is invalid, no tag with that ID exists, or the delete fails.
 */
export async function deleteTag(id: number) {
  const tagId = TagIdSchema.parse(id);

  return prisma.tag.delete({ where: { id: tagId } });
}
