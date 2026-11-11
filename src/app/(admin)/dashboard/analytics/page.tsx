import { AnalyticsPage } from "@/components/pages/admin/AnalyticsPage";

const Page = ({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) => <AnalyticsPage searchParams={searchParams} />;

export default Page;
