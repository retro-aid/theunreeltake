import { getPostTemplatesAction } from "@/lib/actions/template-actions";
import { EmailEditorForm } from "@/components/email/EmailEditorForm";

export async function CreateTemplatePage() {
  const postTemplates = await getPostTemplatesAction();

  return (
    <>
      <h2>Create an email template</h2>
      <EmailEditorForm
        postTemplates={postTemplates.success ? postTemplates.data : []}
      />
    </>
  );
}
