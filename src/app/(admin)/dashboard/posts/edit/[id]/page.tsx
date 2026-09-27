import { PostForm } from "@/components/posts";
import { getPostForEditAction } from "@/lib/actions/post-actions";
import { redirect } from "next/navigation";
import {getAllTags} from "@/lib/dal/tags"

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const post = await getPostForEditAction(id);
  const tagResult = await getAllTags();
  const mediaTags = tagResult.data;

  if (!post) {
    redirect("/dashboard/posts");
  }

  return <PostForm post={post} mediaTags={mediaTags} />;
}