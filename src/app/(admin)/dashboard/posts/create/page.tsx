import {CreatePostPageProps, PostCreatePage} from "@/components/pages/admin";

const Page = (
  { searchParams }: CreatePostPageProps
) => <PostCreatePage searchParams={searchParams}/>;

export default Page;