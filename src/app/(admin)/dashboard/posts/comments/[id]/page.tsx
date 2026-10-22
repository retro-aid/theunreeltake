import { CommentsOnPostPage } from "@/components/pages/admin";

const Page = ({ params }: { params: Promise<{ id: string }> }) => (
  <CommentsOnPostPage params={params} />
);

export default Page;
