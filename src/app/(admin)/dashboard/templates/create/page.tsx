import { TemplateForm } from "@/app/ui/admin/forms/TemplateForm";

export default async function CreateTemplatePage({
  searchParams,
}: {
  searchParams: Promise<{ title?: string; description?: string; htmlContent?: string; isPublic?: boolean}>;
}) {

  const { title, description, htmlContent, isPublic } = await searchParams;

  const prefill = 
    title || description || htmlContent || isPublic
      ? { title: title ?? "", description: description ?? "", htmlContent: htmlContent ?? "", isPublic: isPublic ?? false}
      : undefined;

  return (
    <div>
      <TemplateForm prefill={prefill} />
    </div>
  );
} 