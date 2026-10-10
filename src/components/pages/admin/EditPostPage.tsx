import { PostForm } from "@/components/posts";
import { redirect } from "next/navigation";
import { getAllTagsAction } from "@/lib/actions/tag-actions";
import { getPostAction } from "@/lib/actions/post-actions";
import { GetPostEditDTO } from "@/lib/dal/dto/posts";

/**
 * 
 * Users opens this page to edit posts from getting a post id. 
 * 
 * @param params - Gets the Post's ID from the URL
 * 
 * 
 */
export async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const post: GetPostEditDTO | null = await getPostAction(id);
  const tags = await getAllTagsAction();

  if (!post) {
    redirect("/dashboard/posts");
  }

  return <PostForm post={post} mediaTags={tags} />;
}
