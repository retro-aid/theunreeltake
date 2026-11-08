import { redirect } from "next/navigation";
import { BroadcastComposer } from "@/components/newsletter";
import { list as listMailingLists } from "@/lib/actions/email/mailing-lists-actions";
import { list as listTemplates } from "@/lib/actions/email/templates-actions";
import { requireAdmin } from "@/lib/dal/utils";

export default async function BroadcastPage() {
  try {
    await requireAdmin();
  } catch {
    redirect("/dashboard");
  }

  const [templateResult, mailingListResult] = await Promise.all([
    listTemplates(),
    listMailingLists(),
  ]);

  const loadErrors = [templateResult.error, mailingListResult.error]
    .filter((error) => error !== null)
    .map((error) => error.message);

  return (
    <BroadcastComposer
      templates={(templateResult.data ?? []).map((template) => ({
        value: template.id,
        label: template.name,
        status: template.status,
      }))}
      segments={(mailingListResult.data ?? []).map((mailingList) => ({
        value: mailingList.id,
        label: mailingList.name,
      }))}
      loadError={loadErrors.length > 0 ? loadErrors.join(" ") : undefined}
    />
  );
}
