"use server";

import {
  createComment,
  createReply,
  deleteComment,
  getAdminComments,
  getAmountOfComments,
  getCommentsOnPost,
  getRepliesOnPost
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

export async function postReplyAction(
  postSlug: string,
  parentCommentId: string,
  message: string
) {
  await createReply(parentCommentId, message);
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

export async function getRepliesOnPostAction(
  postSlug: string,
) {
  return getRepliesOnPost(postSlug);
}

export async function getAmountOfCommentsAction(
  period: "day" | "month" | "year"
) {
  return getAmountOfComments(period);
}