import * as email from "@/lib/actions/email";
import { EmailEditorForm } from "@/components/email/EmailEditorForm";
import { EmailTemplateSchema } from "@/lib/schemas/email/templates-schemas";
import { ErrorNotification } from "@/components/email/ErrorNotification";

interface PageParams {
  params: Promise<{ id: string }>;
}

export async function EditTemplatePage({ params }: PageParams) {
  const { id } = await params;

  const apiResponse = await email.templates.get(id);

  if (apiResponse.error || !apiResponse.data) {
    return (
      <ErrorNotification
        message={apiResponse.error.message}
        httpCode={apiResponse.error.status}
      />
    );
  }

  const data = EmailTemplateSchema.parse({
    ...apiResponse.data,
    publish: false,
  });

  return (
    <>
      <h2>Edit an email template</h2>
      <EmailEditorForm template={{ id: id, ...data }} />
    </>
  );
}
