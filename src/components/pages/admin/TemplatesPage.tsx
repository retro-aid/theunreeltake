import { Title, Box, Group } from "@mantine/core";
import { getPostTemplatesAction } from "@/lib/actions/template-actions";
import { NewTemplateButton, TemplateGrid } from "@/components/templates";

/**
 * Admin page that shows all the templates the user can see.
 *
 *
 * Server component, so templates get fetched on the server and passed down.
 * Same setup as `CommentsPage`.
 */
export async function TemplatesPage() {
  const { data: templates } = await getPostTemplatesAction();

  return (
    <Box>
      <Title order={2} mb="xl">
        Your Templates
      </Title>
      <Group justify="flex-end">
        <NewTemplateButton />
      </Group>
      {templates.length === 0 ? (
        <p>You have no saved templates.</p>
      ) : (
        <TemplateGrid data={templates} />
      )}
    </Box>
  );
}
