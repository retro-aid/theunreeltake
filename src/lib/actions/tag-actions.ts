"use server";

import { revalidatePath } from "next/cache";
import {
  createTag,
  deleteTag,
  getAdminTags,
  getAllTags,
  updateTag,
} from "@/lib/dal/dto/tags";
import type { CreateTagForm } from "@/lib/schemas/tag-schemas";

export async function updateTagAction(
  id: number,
  displayName: string,
  type: string,
) {
  try {
    await updateTag(id, displayName, type);
    revalidatePath("/dashboard/tags");
    return {
      error: null,
      success: true,
    };
  } catch (error) {
    console.error("Failed to update tag:", error);
    return {
      error: error,
      success: false,
    };
  }
}

export async function getAllTagsAction() {
  return getAllTags();
}

export async function createTagAction(tag: CreateTagForm) {
  try {
    await createTag(tag);
    revalidatePath("/dashboard/tags");
    return { error: null, success: true };
  } catch (error) {
    console.error("Failed to create tag:", error);
    return { error: error, success: false };
  }
}

export async function deleteTagAction(id: number) {
  try {
    await deleteTag(id);
    revalidatePath("/dashbaord/tags");
    return { error: null, success: true };
  } catch (error) {
    console.error("Failed to delete tag:", error);
    return { error: error, success: false };
  }
}

export async function getAdminTagsAction() {
  return getAdminTags();
}
