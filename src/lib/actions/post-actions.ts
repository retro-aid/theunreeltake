"use server";
import {
  deletePost,
  getPostForEdit,
  getAllPosts,
  togglePublished,
  updatePostAuthor,
  getAllUsers,
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

/**
 * URT-413 change:
 *  - Server action to reassign the author of a specific post.
 *  - Restricts to administrative users by verifying session permissions before updating post ownership in the database.
 * @param id
 * @param newAuthorId
 * @returns Status object indicating success or error.
 */
export async function updatePostAuthorAction(id: string, newAuthorId: string) {
  return updatePostAuthor(id, newAuthorId);
}

/**
 * URT-413 changes:
 *  - Server action to retrieve all registered users for author selection.
 *  - populate the selection dropdown within administrative modals
 *  - Returns public profile data (id, name, email, avatar image).
 * @returns An array of user options for selection.
 */
export async function getAllUsersAction() {
  return getAllUsers();
}

export async function getAdminPostsAction(
  query: Parameters<typeof getAdminPosts>[0],
) {
  return getAdminPosts(query);
}
