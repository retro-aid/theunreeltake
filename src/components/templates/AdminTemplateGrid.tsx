"use client";

import {
  Text,
  Card,
  Box,
  Group,
  ActionIcon,
  Grid,
  Tooltip,
  Divider,
  Badge,
  Button,
  Stack,
} from "@mantine/core";
import Link from "next/link";
import React, { useState } from "react";
import { PencilSquare, Trash, PlusSquare } from "react-bootstrap-icons";
import { DeletePostModal } from "@/components/posts/DeletePostModal";
import { PostTemplate } from "@/generated/prisma/client";
import { deletePostTemplateAction } from "@/lib/actions/template-actions";

type GridProps = {
  data: PostTemplate[];
};

export function PostCard({ template }: { template: PostTemplate }) {
  const [opened, setOpened] = useState(false);
  const onConfirm = async () => {
    await deletePostTemplateAction(template.id);
    setOpened(false);
  };

  const badge = (
    <Badge color={template.isPublic ? "green" : "red"} variant="filled">
      {template.isPublic ? "Public" : "Private"}
    </Badge>
  );

  return (
    <>
      <Card shadow={"sm"} p={"md"} h={"12rem"} withBorder>
        <Stack justify={"space-between"} flex={1} gap={"xs"}>
          <Stack gap={"xs"}>
            <Text fz={"lg"} fw={"600"} truncate="end">
              {template.title}
            </Text>

            <Divider />

            <Text fz={"sm"} c={"dimmed"} lineClamp={3}>
              {template.description}
            </Text>
          </Stack>
          <Group justify={"space-between"}>
            {badge}

            <Group gap={"sm"}>
              <Tooltip label="Edit Template">
                <ActionIcon
                  component={Link}
                  href={`/dashboard/templates/edit/${template.id}`}
                  variant={"filled"}
                  color={"black"}
                  bdrs={"sm"}
                >
                  <PencilSquare />
                </ActionIcon>
              </Tooltip>

              <Tooltip label="Delete Template">
                <ActionIcon
                  variant={"filled"}
                  bdrs={"sm"}
                  color={"red"}
                  onClick={() => setOpened(true)}
                >
                  <Trash />
                </ActionIcon>
              </Tooltip>
            </Group>
          </Group>
        </Stack>
      </Card>

      <DeletePostModal
        opened={opened}
        onClose={() => setOpened(false)}
        onConfirm={onConfirm}
      />
    </>
  );
}

/**
 * Grid of template cards.
 *
 * Icons are imported here now instead of passed in as a prop, since a server
 * component can't pass components down to a client component.
 *
 */
export function TemplateGrid({ data }: GridProps) {
  return (
    <Grid m={"lg"}>
      {data.map((template) => (
        <Grid.Col key={template.id} span={{ base: 12, sm: 6, md: 4, lg: 3 }}>
          <PostCard template={template} />
        </Grid.Col>
      ))}
    </Grid>
  );
}

/**
 * Button that links to the create template page.
 *
 * Kept in a client component because Mantine's `component={Link}` prop doesn't
 * work in server components.
 */
export function NewTemplateButton() {
  return (
    <Button
      component={Link}
      href="/dashboard/templates/create"
      leftSection={<PlusSquare size={16} />}
    >
      New Template
    </Button>
  );
}
