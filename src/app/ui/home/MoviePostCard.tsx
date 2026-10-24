"use client";

import {
  AspectRatio,
  Badge,
  Card,
  rem,
  Stack,
  Image,
  useMantineTheme,
  ActionIcon,
  Group,
  Text,
  Button,
  Flex,
  Popover,
  useMatches,
} from "@mantine/core";

import classes from "./MoviePostCard.module.css";

import { CatalogItem } from "@/app/api/catalog/route";
import { useElementSize } from "@mantine/hooks";
import { Flip } from "@gfazioli/mantine-flip";
import { useState } from "react";
import { X, Person, Calendar } from "react-bootstrap-icons";
import Link from "next/link";
import dayjs from "dayjs";

/**
 * Displays the layout and basic information of the post card
 *
 * @remarks Gets import to these files:
 * Blog Post Page: /src/app/(home)/blog/[slug]/page.tsx
 * PostGrid.tsx: /src/app/ui/home/PostGrid.tsx
 *
 * @returns Information such as Title, Author, Date Published, Tags, and Preview of Post Content
 */

const MAX_VISIBLE_TAGS = 1;

export function MoviePostCard({ postData }: { postData: CatalogItem }) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [tagsOpen, setTagsOpen] = useState(false); //Open Tag Popover

  const theme = useMantineTheme();

  const { ref, width } = useElementSize();

  //Tag display for each post card
  const allTags = postData.tags?.map((t) => t.tag) ?? [];
  const visibleTags = allTags.slice(0, MAX_VISIBLE_TAGS);
  const hiddenTags = allTags.slice(MAX_VISIBLE_TAGS);

  //Amount of lines for Preview Content
  const clamp = useMatches({ base: 4, sm: 6, md: 5, lg: 5 });

  //Remove HTML Tags from htmlContent for the preview
  const preview = (postData.htmlContent ?? "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|li|h[1-6])>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .trim();

  return (
    <AspectRatio
      ratio={2 / 3}
      maw={{ base: 250, lg: 300, xl: 400 }}
      mx="auto"
      ref={ref}
    >
      <Flip flipped={isFlipped} duration={0.6}>
        <Card
          className={classes.card}
          w={"100%"}
          h={"100%"}
          shadow={`3px 3px 10px ${theme.colors.gray[9]}`}
          p={0}
          bdrs={"sm"}
          onClick={() => setIsFlipped(true)}
        >
          <Image
            alt={postData.title}
            w={"100%"}
            h={"100%"}
            src={
              postData.posterUrl ??
              `https://placehold.co/200x300?text=${postData.title.split(" ").join("+")}`
            }
          />
        </Card>

        <Card
          w={"100%"}
          h={"100%"}
          shadow={`3px 3px 10px ${theme.colors.gray[9]}`}
          bdrs={"sm"}
          p={"sm"}
          onClick={() => setIsFlipped(false)}
        >
          <Group align={"start"} h={"100%"} wrap={"nowrap"} gap={"xs"}>
            <Flex direction={"column"} w={"100%"} h={"100%"}>
              <Stack
                align={"stretch"}
                h={"100%"}
                pb={"xs"}
                px={rem(width / 20)}
                gap={6}
              >
                <Text
                  lh={1.3}
                  fz={{ base: 16, sm: 15, md: 20, lg: 20 }}
                  fw={"bold"}
                  lineClamp={2}
                >
                  {postData.title}
                </Text>

                {/*applied here to map over all tags without crashing */}
                {allTags.length > 0 && (
                  <Group gap={1} wrap="wrap">
                    {visibleTags.map((tag) => (
                      <Badge
                        key={tag.id}
                        color="blue"
                        variant="light"
                        maw="100%"
                        size="xs"
                        fz="9"
                      >
                        {tag.displayName}
                      </Badge>
                    ))}
                    {hiddenTags.length > 0 && (
                      <Popover
                        opened={tagsOpen}
                        onChange={setTagsOpen}
                        position="bottom"
                        width={"max-content"}
                      >
                        <Popover.Target>
                          <Badge
                            color="gray"
                            variant="outline"
                            fz={"9"}
                            size="xs"
                            style={{ cursor: "default" }}
                            aria-label={`Show ${hiddenTags.length} more tags`}
                            onClick={(e) => {
                              e.stopPropagation();
                              setTagsOpen((o) => !o);
                            }}
                          >
                            More Tags
                          </Badge>
                        </Popover.Target>
                        <Popover.Dropdown
                          p="xs"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Group gap={4} wrap="wrap">
                            {hiddenTags.map((tag) => (
                              <Badge
                                key={tag.id}
                                color="blue"
                                variant="light"

                                fz={"9"}
                                size="xs"
                                maw="100%"

                                onClick={(e) => e.stopPropagation()}
                              >
                                {tag.displayName}
                              </Badge>
                            ))}
                          </Group>
                        </Popover.Dropdown>
                      </Popover>
                    )}
                  </Group>
                )}

                <Group gap={1} wrap="nowrap" align="center">
                  <Text
                    size={rem(width / 16)}
                    fz={{ base: 12, sm: 11, md: 12, lg: 12 }}
                  >
                    Post By: {postData.author.name}
                  </Text>
                </Group>

                <Group gap={3} wrap="nowrap" align="center">
                  <Text
                    size={rem(width / 16)}
                    fz={{ base: 12, sm: 12, md: 12, lg: 12 }}
                    lineClamp={1}
                  >
                    Published: {dayjs(postData.createdAt).format("MMM D, YYYY")}
                  </Text>
                </Group>

                <Text lineClamp={clamp} fz="xs" c="dimmed">
                  {preview}
                </Text>
              </Stack>
            </Flex>
          </Group>

          <Button
            component={Link}
            href={`/blog/${postData.slug}`}
            prefetch={false}
            size={"sm"}
            color={"dark"}
            bdrs={"sm"}
            onClick={(e) => e.stopPropagation()}
          >
            View Post
          </Button>
        </Card>
      </Flip>
    </AspectRatio>
  );
}
