import { PostForm } from "@/components/posts";
import { getAllTagsAction } from "@/lib/actions/tag-actions";
import { getMediaRequestAction } from "@/lib/actions/media-request-actions";

export type CreatePostPageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function PostCreatePage({ searchParams }: CreatePostPageProps) {
  const tags = await getAllTagsAction();

  const { mrid } = await searchParams;

  // Return empty Post Form
  if (!mrid) return <PostForm mediaTags={tags} />;

  const mediaRequestId = Array.isArray(mrid) ? (mrid.at(0) ?? "") : mrid;

  const mediaRequest = await getMediaRequestAction(mediaRequestId);

  // Return empty if media request not found
  if (!mediaRequest) return <PostForm mediaTags={tags} />;

  //Construct Prefill Data
  const prefill = {
    title: mediaRequest.title,
    message: "",
    mediaTags: [],
  };

  return <PostForm mediaTags={tags} prefill={prefill} />;
}
