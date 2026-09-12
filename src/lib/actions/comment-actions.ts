"use server";

import {
  createComment,
  deleteComment,
  getAdminComments,
  getCommentsOnPost
} from "@/lib/dal/dto/comments";
import {AnonymousCommentForm} from "@/lib/schemas/comment-schemas";
import {revalidatePath} from "next/cache";

export async function postAnonymousCommentAction(
  postSlug: string,
  formData: AnonymousCommentForm
) {
  await createComment(postSlug, formData);
  revalidatePath(`/blog/${postSlug}`);
}

export async function deleteCommentAction(
  id: string
) {
  await deleteComment(id);
  revalidatePath("/dashboard/comments");
}

export async function getAdminCommentsAction() {
  return getAdminComments();
}

export async function getCommentsOnPostAction(
  postSlug: string
) {
  return getCommentsOnPost(postSlug);
}