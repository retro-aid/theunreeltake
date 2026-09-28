"use server";
import {
  deletePost,
  getPostForEdit,
  getAllPosts,
  togglePublished,
} from "@/lib/dal/posts";
import {
  createPost,
  CreatePostArgs,
  getAdminPosts,
  getPost,
  updatePost,
  UpdatePostArgs,
} from "@/lib/dal/dto/posts";

export async function getPostAction(id: string) {
  return getPost(id);
}

export async function createPostAction(createPostArgs: CreatePostArgs) {
  return createPost(createPostArgs);
}

export async function deletePostAction(id: string) {
  return deletePost(id);
}

export async function getPostForEditAction(id: string) {
  return getPostForEdit(id);
}

export async function getAllPostsAction({
  page = 1,
  limit = 10,
  search = "",
  filter = "",
  sort = "",
}: {
  page?: number;
  limit?: number;
  search?: string;
  filter?: string;
  sort?: string;
}) {
  return getAllPosts({
    page,
    limit,
    search,
    filter,
    sort,
  });
}

export async function togglePublishedAction(id: string) {
  return togglePublished(id);
}

export async function updatePostAction(updatePostArgs: UpdatePostArgs) {
  return updatePost(updatePostArgs);
}

export async function getAdminPostsAction(
  query: Parameters<typeof getAdminPosts>[0],
) {
  return getAdminPosts(query);
}
