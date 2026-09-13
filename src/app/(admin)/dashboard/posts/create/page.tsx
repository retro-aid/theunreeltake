import { PostForm } from "@/app/ui/admin/forms/PostForm";
import { getAllTags } from "@/lib/actions";
import { AllowedTagType } from "@/lib/constants";

export default async function CreatePostPage({
  searchParams,
}: {
  searchParams: Promise<{ title?: string; message?: string; type?: string }>;
}) {

  const { title, message, type } = await searchParams;

  let mediaTagId = 0;
  if (type) {
    const { data } = await getAllTags(AllowedTagType.Media);
    mediaTagId = data?.find((t) => t.displayName === type)?.id ?? 0;
  }

  const prefill = 
    title || message || mediaTagId 
      ? { title: title ?? "", message: message ?? "", mediaTagId}
      : undefined;

  return (
    <div>
      <PostForm prefill={prefill} />
    </div>
  );
} 