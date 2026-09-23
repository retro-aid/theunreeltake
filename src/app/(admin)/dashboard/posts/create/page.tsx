
import { PostForm } from "@/components/posts/PostForm";
import { getAllTags } from "@/lib/dal/tags";



export default async function CreatePostPage({
  searchParams,
}: {
  searchParams: Promise<{
    title?: string;
    message?: string;
    type?: string;
  }>;
}) 
{
	const { title, message, type } = await searchParams;

	const result = await getAllTags();

	const mediaTags = result.data;

	const mediaTagId =
		mediaTags.find((tag) => tag.displayName === type)?.id ?? 0;

  const prefill =
    title || message || mediaTagId
      ? {
          title: title ?? "",
          message: message ?? "",
          mediaTagId,
        }
      : undefined;

  return (
    <PostForm
      prefill={prefill}
      mediaTags={mediaTags}
    />
  );
}