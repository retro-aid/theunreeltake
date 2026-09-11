"use server";

import {createComment} from "@/lib/dal/dto/comments";
import {AnonymousCommentForm} from "@/lib/schemas/comment-schemas";
import {revalidatePath} from "next/cache";

export async function postAnonymousCommentAction(
  postSlug: string,
  formData: AnonymousCommentForm
) {
  await createComment(postSlug, formData);
  revalidatePath(`/blog/${postSlug}`);
}