"use server";

import { getAdminPosts, updatePost, UpdatePostArgs } from "@/lib/dal/dto/posts";

export async function updatePostAction(
  updatePostArgs: UpdatePostArgs
) {
  return updatePost(updatePostArgs);
}

export async function getAdminPostsAction(
  query: Parameters<typeof getAdminPosts>[0]
) {
  return getAdminPosts(query);
}