import {
  Box,
  Container,
  Group,
  Paper,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import dayjs from "dayjs";
import React from "react";
import { PostImages } from "@/components/posts/PostImages";

/** Format used for every date shown on a post. */
const POST_DATE_FORMAT = "MMM D, YYYY h:mm A";

/**
 * The fields needed to display a post the way it shows on the blog page.
 *
 * @property title - The post's title.
 * @property imageUrls - URLs of the images.
 * @property htmlContent - the posts HTML body.
 * @property authorName - Name of the post's author.
 * @property createdAt - When the post was created.
 * @property updatedAt - When the post was last updated.
 */
export interface PostContentData {
  title: string;
  imageUrls: string[];
  htmlContent: string;
  authorName: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Renders a small labeled card with one piece of post info (author, date, etc.).
 *
 * @param props - The detail's properties.
 * @param props.label - The heading shown above the value.
 * @param props.value - The text being displayed.
 */
export function PostDetail({ label, value }: { label: string; value: string }) {
  return (
    <Paper shadow={"xs"} bg={"gray.0"} p={"xs"} bdrs={0} miw={175}>
      <Stack gap={0}>
        <Text component={"span"} size={"xs"} fw={500}>
          {label}
        </Text>
        <Text>{value}</Text>
      </Stack>
    </Paper>
  );
}

/**
 * Renders the centered paper container that wraps a blog post's contents.
 *
 * @param props - The layout's properties.
 * @param props.children - The content shown inside the post container.
 */
export function PostLayout({ children }: { children: React.ReactNode }) {
  return (
    <Container px={{ base: 0, md: "md" }}>
      <Paper
        w={{ base: "300", sm: "700", md: "900" }}
        shadow={"sm"}
        p={{ base: "md", sm: "xl" }}
        bdrs={0}
      >
        <Stack>{children}</Stack>
      </Paper>
    </Container>
  );
}

/**
 * Renders a post's title, images, author and date info, and HTML body
 * the same way they appear on the published blog page.
 *
 * @param props - The component's properties.
 * @param props.post - The post data to display.
 */
export function PostContent({ post }: { post: PostContentData }) {
  const details = [
    { label: "Written By:", value: post.authorName },
    { label: "Posted:", value: dayjs(post.createdAt).format(POST_DATE_FORMAT) },
    {
      label: "Updated:",
      value: dayjs(post.updatedAt).format(POST_DATE_FORMAT),
    },
  ];

  return (
    <>
      <Title order={1} my={"lg"}>
        {post.title}
      </Title>

      <PostImages urls={post.imageUrls} title={post.title} />

      <Group gap={"md"}>
        {details.map(({ label, value }) => (
          <PostDetail key={label} label={label} value={value} />
        ))}
      </Group>

      <Box>
        <div dangerouslySetInnerHTML={{ __html: post.htmlContent }}></div>
      </Box>
    </>
  );
}
