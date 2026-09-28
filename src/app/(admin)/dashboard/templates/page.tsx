"use client";

import {useEffect, useState, useTransition} from "react";
import { Title, Box, Loader, Center, Button, Group } from "@mantine/core";
import { PencilSquare, Chat, BarChart, Trash, PlusSquare } from "react-bootstrap-icons";
import { PostTemplate } from "@/generated/prisma/client";
import { getPostTemplatesAction } from "@/lib/actions/template-actions";
import { TemplateGrid } from "@/app/ui/admin/AdminTemplateGrid";
import Link from "next/link";

const GRID_ICONS = {
  Edit: PencilSquare,
  Chat: Chat,
  Stats: BarChart,
  Delete: Trash,
};

export default function TemplatePage() {

  const [templates, setTemplates] = useState<PostTemplate[]>([]);
  const [isLoading, startTransition] = useTransition();

  useEffect(() => {
    startTransition(async () => {

      const result = await getPostTemplatesAction();

      if(result.success) {
        setTemplates(result.data);
      }

    });
  }, []);

  return (
    <Box>
      <Title order={2} mb="xl">Your Templates</Title>
        <Group justify="flex-end">
            <Button 
            component={Link}
            href={"/dashboard/templates/create"}
            leftSection={<PlusSquare size={16}></PlusSquare>}
            >
                New Template
            </Button>
        </Group>
      {isLoading ? (
        <Center mt="xl">
          <Loader color="blue" />
        </Center>
      ) : templates.length === 0 ? (
        <p>You have no saved templates.</p>
      ) : (
        <TemplateGrid data={templates} icons={GRID_ICONS} />
      )}
    </Box>
  );
}