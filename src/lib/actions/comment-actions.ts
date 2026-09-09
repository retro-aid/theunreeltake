"use server";

import {createComment} from "@/lib/dal/dto/comments";
import {AnonymousCommentForm} from "@/lib/schemas/comment-schemas";

export async function postAnonymousCommentAction(
  formData: AnonymousCommentForm
) {
  await createComment(formData);
}