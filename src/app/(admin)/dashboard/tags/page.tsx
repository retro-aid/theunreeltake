import prisma from "@/lib/prisma";
import { Paper, Stack } from "@mantine/core";
import TagsTable from "@/app/ui/admin/TagsTable";
import CreateTagForm from "@/app/ui/admin/forms/CreateTagForm";

export default async function TagsPage() {
  const tags = await prisma.tag.findMany();

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
