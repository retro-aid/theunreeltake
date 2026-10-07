import { Paper, Stack } from "@mantine/core";
import { getAdminTagsAction } from "@/lib/actions/tag-actions";
import { CreateTagForm, TagsTable } from "@/components/tags";

/**
 * Renders the admin "Manage Tags" page: a heading, a table of all tags with
 * inline edit and delete controls, and a form for creating a new tag.
 * Fetches the tags on the server. Takes no props.
 */
export async function TagsPage() {
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
