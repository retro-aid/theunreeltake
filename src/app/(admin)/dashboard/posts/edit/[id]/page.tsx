import { PostForm } from "@/components/posts";
import { redirect } from "next/navigation";
import { getAllTagsAction } from "@/lib/actions/tag-actions";
import { getPostAction } from "@/lib/actions/post-actions";
import {GetPostEditDTO} from "@/lib/dal/dto/posts";

export default async function EditPostPage({
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