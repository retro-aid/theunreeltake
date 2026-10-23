import { CulledAdminComment, getAdminComments } from "@/lib/dal/dto/comments";
import { AdminCommentSearch } from "@/components/comments";

type CommentsOnPostPageParams = {
  params: Promise<{
    id: string;
  }>;
};

/**
 * The Page component for /dashboard/posts/comments/[id] route
 *
 * @remarks
 * Renders an asynchronous component that queries for comments using the post id.
 * The page parameters are provided by Next.js by default
 *
 * @param params - The page parameters object
 * @param params.id - The id of the post that comments are being viewed on
 */
export async function CommentsOnPostPage({ params }: CommentsOnPostPageParams) {
  const { id } = await params;

  const commentsOnPost: CulledAdminComment[] = await getAdminComments(id);

  return <AdminCommentSearch comments={commentsOnPost} />;
}
