"use server";
import {
    savePost,
    createNewPost,
    deletePost,
    getPostForEdit,
    getAllPosts,
	togglePublished,

} from "@/lib/dal/posts";

import { getAllTags } from "@/lib/dal/tags";

export async function savePostAction(id: string,
  title: string,
  slug: string,
  content: string,
  published: boolean,
  posterUrl: string | null,
  mediaTagId: number)
{
  return savePost(id, title, slug, content, published, posterUrl, mediaTagId);
}

export async function createNewPostAction(formData: {
    title: string,
    slug: string,
    mediaTagId: number,
    pageContent: string,
    published: boolean,
    posterUrl: string | null
  })
{
  return createNewPost(formData);
}

export async function deletePostAction(id:string)
{
  return deletePost(id);
}

export async function getPostForEditAction(id: string)
{
  return getPostForEdit(id);
}

export async function getAllPostsAction({
  page = 1,
  limit = 10,
  search = "",
}: {
  page?: number;
  limit?: number;
  search?: string;
})
{
	return getAllPosts({
		page,
		limit,
		search,
	});
}

export async function togglePublishedAction(id:string)
{
	return togglePublished(id);
}

export async function getAllTagsAction() {
    return await getAllTags();
}