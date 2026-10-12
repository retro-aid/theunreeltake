import { CreateTemplatePage } from "@/components/pages/admin";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{
    title?: string;
    description?: string;
    htmlContent?: string;
    isPublic?: boolean;
  }>;
}) {
  return <CreateTemplatePage searchParams={searchParams} />;
}
