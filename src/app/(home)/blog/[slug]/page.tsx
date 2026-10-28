import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ViewTracker } from "@/app/ui/home/ViewTracker";
import {
  Title,
  Grid,
  GridCol,
  Text,
  Group,
  Flex,
  Button,
  Box,
} from "@mantine/core";
import { CommentGrid, VisitorCommentForm } from "@/components/comments";
import { getRepliesOnPostAction } from "@/lib/actions/comment-actions";
import { MoviePostCard } from "@/app/ui/home/MoviePostCard";
import { PostContent, PostLayout } from "@/components/posts";

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const data = await prisma.post.findUnique({
    where: { slug: slug },
    include: {
      tags: { include: { tag: true }, omit: { postId: true, tagId: true } },
      author: { select: { name: true, image: true } },
    },
    omit: { authorId: true },
  });

  if (!data || !data.published) redirect("/catalog");

  const currentTagIds = data.tags.map(({ tag }) => tag.id);

  const relatedTaggedPosts = await prisma.post.findMany({
    where: {
      published: true,
      id: { not: data.id },
      tags: { some: { tag: { id: { in: currentTagIds } } } },
    },
    include: {
      author: { select: { name: true } },
      tags: { include: { tag: true }, omit: { postId: true, tagId: true } },
    },
    omit: {
      authorId: true,
    },
  });

  const currentTagIdsSet = new Set(currentTagIds);

  const relatedPosts = relatedTaggedPosts
    .map((post) => ({
      post,
      sharedTagcount: post.tags.filter(({ tag }) =>
        currentTagIdsSet.has(tag.id),
      ).length,
    }))
    .sort((a, b) => b.sharedTagcount - a.sharedTagcount)
    .slice(0, 4)
    .map(({ post }) => post);

  const remainingSlots = 4 - relatedPosts.length;

  if (remainingSlots > 0) {
    const relatedPostsIds = new Set(relatedPosts.map((post) => post.id));

    const recentPosts = await prisma.post.findMany({
      where: {
        published: true,
        id: { notIn: [data.id, ...relatedPostsIds] },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: remainingSlots,
      include: {
        author: { select: { name: true } },
        tags: { include: { tag: true }, omit: { postId: true, tagId: true } },
      },
      omit: {
        authorId: true,
      },
    });
    relatedPosts.push(...recentPosts);
  }

  const tagElements = data.tags.map((value, index) => {
    return (
      <Button
        key={index}
        color={"dark"}
        variant={"outline"}
        size={"sm"}
        mt={4}
        onClick={async () => {
          "use server";
          const url: string = "/catalog?tags=" + value.tag.id;
          redirect(url);
        }}
      >
        {value.tag.displayName}
      </Button>
    );
  });

  //const comments = await getCommentsOnPostAction(slug);
  const comments = await getRepliesOnPostAction(slug);

  return (
    <Box bg={"gray.0"}>
      <ViewTracker slug={slug} />
      <PostLayout>
        <PostContent post={{ ...data, authorName: data.author.name }} />

        {relatedPosts.length > 0 && (
          <Box>
            <Text component={"span"} size={"lg"} fw={700}>
              Related Posts:
            </Text>

            <Grid>
              {relatedPosts.map((post) => (
                <GridCol key={post.slug} span={{ base: 12, sm: 6, md: 3 }}>
                  <MoviePostCard postData={post}></MoviePostCard>
                </GridCol>
              ))}
            </Grid>
          </Box>
        )}

        <Text size="sm" ta="left" fw={500}>
          Tags:
        </Text>
        <Group>{tagElements}</Group>

        <VisitorCommentForm slug={slug} />

        <Title order={4}>Recent Comments</Title>

        <CommentGrid comments={comments} />
      </PostLayout>
    </Box>
  );
}
