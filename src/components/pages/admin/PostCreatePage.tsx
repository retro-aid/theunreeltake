import {PostForm} from "@/app/ui/admin/forms/PostForm";
import {getMediaRequestAction} from "@/lib/actions/media-request-actions";

export type CreatePostPageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function PostCreatePage(
  { searchParams }: CreatePostPageProps
) {

  const { mrid } = await searchParams;

  if(!mrid) return <PostForm/>;

  const mediaRequestId = Array.isArray(mrid) ? mrid.at(0) ?? "" : mrid;

  const mediaRequest = await getMediaRequestAction(mediaRequestId);

  if(!mediaRequest) return <PostForm/>;

  return <PostForm prefill={{ title: mediaRequest.title, message: "", mediaTagId: 0}}/>;
}