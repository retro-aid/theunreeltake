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
} from "@mantine/core";
import Link from "next/link";
import React, { useState } from "react";
import { PencilSquare, Trash, PlusSquare } from "react-bootstrap-icons";
import { DeletePostModal } from "@/app/ui/admin/DeletePostModal";
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
  return (
    <>
      <Card shadow={"sm"} padding={"lg"} w={"249"} h={"242"} withBorder>
        <Card.Section>
          <Box p="xs">
            {!template.isPublic && (
              <Badge
                color="red"
                pos="absolute"
                mt={"192"}
                ml={"15"}
                variant="filled"
              >
                Private
              </Badge>
            )}
            {template.isPublic && (
              <Badge
                color="green"
                pos="absolute"
                mt={"192"}
                ml={"15"}
                variant="filled"
              >
                Public
              </Badge>
            )}

            <Text
              fz="20"
              fw="700"
              mt={"5"}
              ml={"10"}
              ta={"center"}
              truncate="end"
            >
              {template.title}
            </Text>

            <Divider my="sm" />

            <Text
              fz="15"
              fw="300"
              mt={"5"}
              ml={"10"}
              ta={"left"}
              style={{
                textWrap: "balance",
              }}
            >
              {template.description}
            </Text>

            <Group
              style={{
                position: "absolute",
                bottom: 15,
                right: 15,
              }}
              gap={10}
            >
              <Tooltip label="Edit Template">
                <ActionIcon
                  component={Link}
                  href={`/dashboard/templates/edit/${template.id}`}
                  variant={"filled"}
                  size={"md"}
                  bdrs={"xs"}
                  color={"black"}
                >
                  <PencilSquare size={16} />
                </ActionIcon>
              </Tooltip>

              <Tooltip label="Delete Template">
                <ActionIcon
                  variant={"filled"}
                  size={"md"}
                  bdrs={"xs"}
                  color={"red"}
                  onClick={() => setOpened(true)}
                >
                  <Trash size={16} />
                </ActionIcon>
              </Tooltip>
            </Group>
          </Box>
        </Card.Section>
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
    <Grid>
      {data.map((template) => (
        <Grid.Col
          key={template.id}
          style={{ minWidth: 250 }}
          span={{ base: 12, sm: 6, md: 3 }}
        >
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
