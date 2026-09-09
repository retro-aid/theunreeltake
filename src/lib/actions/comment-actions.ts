"use server";

import {CommentFormValues} from "@/lib/schemas";
import {createComment} from "@/lib/dal/dto/comments";

export async function postAnonymousCommentAction(
  formData: CommentFormValues
) {

  await createComment(formData);
}