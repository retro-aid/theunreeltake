import { EditTemplatePage } from "@/components/pages/admin";

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  return <EditTemplatePage params={params} />;
}
