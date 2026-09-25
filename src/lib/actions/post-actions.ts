"use server";

import {updatePost, UpdatePostArgs} from "@/lib/dal/dto/posts";

export async function updatePostAction(
  updatePostArgs: UpdatePostArgs
) {
  return updatePost(updatePostArgs);
}