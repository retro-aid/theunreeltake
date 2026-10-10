import { EditPostPage } from "@/components/pages/admin";


const Page = ({ params }: {params: Promise<{ id: string }>}) => (
  <EditPostPage params={params} />
);

export default Page;
