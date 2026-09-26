import { PostForm } from "@/app/ui/admin/forms/PostForm";
import { getAllTags } from "@/lib/actions";
import { AllowedTagType } from "@/lib/constants";

export default async function CreatePostPage({
  searchParams,
}: {
  searchParams: Promise<{ title?: string; message?: string; type?: string }>;
}) {

  const { title, message, type } = await searchParams;

  let mediaTagId: number[] = [];
  if (type) {
    const { data } = await getAllTags(AllowedTagType.Media);
    const foundId = data?.find((t) => t.displayName === type)?.id;
    
    if (foundId) {
      mediaTagId = [foundId];
    }
  }

  const prefill = 
    title || message || mediaTagId.length > 0
      ? { title: title ?? "", message: message ?? "", mediaTagId}
      : undefined;

  return (
    <div>
      <PostForm prefill={prefill} />
    </div>
  );
} 