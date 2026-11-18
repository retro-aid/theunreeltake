import { redirect } from "next/navigation";
import {
  Flex,
  Group,
  Text,
  Stack,
  Card,
  SimpleGrid,
  Loader,
  Image,
  Button,
} from "@mantine/core";
import { CalendarDate, PersonFill } from "react-bootstrap-icons";
import { getRecentUserReviewsAction } from "@/lib/actions/analytics-actions";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { AnalyticsDashboard } from "@/components/analytics";

interface RecentPostItem {
  id: string;
  title: string;
  slug: string;
  posterUrl?: string | null;
  htmlContent?: string | null;
  createdAt: string | Date;
  author?: {
    name?: string | null;
  } | null;
}

export async function DashboardPage() {
  const contextData = await auth.api.getSession({
    headers: await headers(),
  });

  if (!contextData) redirect("/login");

  const res = await getRecentUserReviewsAction(5);

  const posts =
    res.success && res.data ? (res.data as unknown as RecentPostItem[]) : [];

  return (
    <>
      <h1>Welcome, {contextData.user.name}!</h1>

      <AnalyticsDashboard />

      <h2>Recent Reviews</h2>

      {posts.length === 0 ? (
        <Flex justify="center" p="xl">
          <Loader size="sm" />
        </Flex>
      ) : posts.length === 0 ? (
        <Text c="dimmed">No posts found.</Text>
      ) : (
        <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 5 }} spacing="md">
          {posts.map((post) => (
            <Card
              key={post.id}
              shadow="sm"
              padding="md"
              radius="md"
              withBorder
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <Image
                src={
                  post.posterUrl ??
                  `https://placehold.co/400x250?text=${encodeURIComponent(
                    post.title,
                  )}`
                }
                radius="sm"
                height={140}
                alt={post.title}
                fit="cover"
              />

              <Stack gap="xs" mt="sm" style={{ flexGrow: 1 }}>
                <Text fw={600} size="sm" lineClamp={1} title={post.title}>
                  {post.title}
                </Text>

                <Group gap={6} align="center">
                  <PersonFill size={13} />
                  <Text size="xs" c="dimmed">
                    {post.author?.name || "Unknown"}
                  </Text>
                </Group>

                <Group gap={6} align="center">
                  <CalendarDate size={13} />
                  <Text size="xs" c="dimmed">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </Text>
                </Group>
              </Stack>

              <Button
                component={"a"}
                href={`/blog/${post.slug}`}
                variant="light"
                color="blue"
                fullWidth
                mt="md"
                radius="md"
                size="xs"
              >
                View Post
              </Button>
            </Card>
          ))}
        </SimpleGrid>
      )}
    </>
  );
}
