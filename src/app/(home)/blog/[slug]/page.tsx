import prisma from "@/lib/prisma";
import { redirect } from 'next/navigation';
import { ViewTracker } from "@/app/ui/home/ViewTracker";
import {
  Title,
  Grid,
  GridCol,
  Image,
  Text,
  Group,
  Stack,
  Textarea,
  Flex,
  Paper,
  Button, Container, Box
} from "@mantine/core";
import dayjs from "dayjs";
import { MoviePostCard } from "@/app/ui/home/MoviePostCard";

export default async function BlogPostPage(
  {
    params
  }: {
    params: Promise<{ slug: string }>
  }
) {

  const { slug } = await params;

  const data = await prisma.post.findUnique({
    where: { slug: slug },
    include: {
      tags: { include: { tag: true }, omit: { postId: true, tagId: true }},
      author: { select: { name: true, image: true } }
    },
    omit: { authorId: true }
  });

  if (!data || !data.published) redirect ("/catalog");

  const currentTagIds = data.tags.map(({ tag }) => tag.id)

  const relatedTaggedPosts = await prisma.post.findMany({
    where: {
      published: true,
      id: { not: data.id },
      tags: { some: { tag: { id: { in: currentTagIds } } } },
    },
    include: { 
      author: { select: { name: true } },
      tags: { include: { tag: true }, omit: { postId: true, tagId: true } }
    },
    omit: {
      authorId: true
    },
  });

  const currentTagIdsSet = new Set(currentTagIds);

  const relatedPosts = relatedTaggedPosts
    .map((post) => ({ post, sharedTagcount: post.tags.filter(( { tag }) => currentTagIdsSet.has(tag.id)).length}))
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
    return(
      <Button 
        key={index}
        color={"dark"}
        variant={"outline"}
        size={"sm"}
        mt={4}
        onClick={async () => {
          "use server"
          const url: string = "/catalog?tags="+value.tag.id;
          redirect (url);
        }}
      >
        {value.tag.displayName}
      </Button>
    );
  });


  return (
    <Flex bg={"gray.0"}>
      <ViewTracker slug={slug} />
      <Container px={{ base: 0, md: "md"}}>
        <Paper shadow={"sm"} p={{ base: "md", sm: "xl"}} bdrs={0}>
          <Stack>

            <Title order={1} my={"lg"}> {data.title}  </Title>

            <Grid align="flex-start" columnGap={"xs"}>
              <GridCol span={{base: 12, md: 6}}>
                <Image
                  alt={"Test"}
                  src={"https://placehold.co/640x360"}
                />
              </GridCol>
              <GridCol span={{base: 12, md: 6}}>
                <Image
                  alt={"Test"}
                  src={"https://placehold.co/640x360"}
                />
              </GridCol>
            </Grid>

            <Group gap={"md"}>

              <Paper shadow={"xs"} bg={"gray.0"} p={"xs"} bdrs={0} miw={175}>
                <Stack gap={0}>
                  <Text component={"span"} size={"xs"} fw={500}>Written By:</Text>
                  <Text>{data.author.name}</Text>
                </Stack>
              </Paper>

              <Paper shadow={"xs"} bg={"gray.0"} p={"xs"} bdrs={0} miw={175}>
                <Stack gap={0}>
                  <Text component={"span"} size={"xs"} fw={500}>Posted:</Text>
                  <Text>{dayjs(data.createdAt).format("MMM D, YYYY h:mm A")}</Text>
                </Stack>
              </Paper>

              <Paper shadow={"xs"} bg={"gray.0"} p={"xs"} bdrs={0} miw={175}>
                <Stack gap={0}>
                  <Text component={"span"} size={"xs"} fw={500}>Updated:</Text>
                  <Text>{dayjs(data.updatedAt).format("MMM D, YYYY h:mm A")}</Text>
                </Stack>
              </Paper>

            </Group>

            <Box>
              <div dangerouslySetInnerHTML={{__html: data.htmlContent}}></div>
            </Box>

            {relatedPosts.length > 0 && (
              <Box>
                <Text component={"span"} size={"lg"} fw={700}>
                  Related Posts:
                </Text>

                <Grid>
                  {relatedPosts.map((post) => (
                    <GridCol key={post.slug} span={{base: 12, sm: 6, md: 3}}>
                      <MoviePostCard postData={post}></MoviePostCard>
                    </GridCol>
                  ))}
                </Grid>
              </Box>
            )}

            <Text size="sm" ta="left" fw={500}>Tags:</Text>
            <Group>
              {tagElements}
            </Group>

            <Textarea
              label="Leave a comment"
              placeholder="Your comment"
              autosize
              minRows={4}
            />

          </Stack>
        </Paper>
      </Container>
    </Flex>
  );
}