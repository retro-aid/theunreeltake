import { Paper, Stack } from "@mantine/core";
import { getAdminTagsAction } from "@/lib/actions/tag-actions";
import { CreateTagForm, TagsTable } from "@/components/tags";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

/**
 * Renders the admin "Manage Tags" page: a heading, a table of all tags with
 * inline edit and delete controls, and a form for creating a new tag.
 * Fetches the tags on the server. Takes no props. Redirects back to dashboard if the user isn't an admin
 */
export async function TagsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session?.user.role != "admin") redirect("/dashboard");

  const tags = await getAdminTagsAction();

  return (
    <div>
      <h1>Manage Tags</h1>
      <Stack maw={"75%"}>
        <Paper radius={"md"} withBorder>
          <TagsTable data={tags} />
        </Paper>

        <CreateTagForm />
      </Stack>
    </div>
  );
}
