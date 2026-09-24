"use client";

import {useContext, useEffect, useState} from "react";
import {AuthContext} from "@/app/ui/admin/AuthContext";
import {redirect} from "next/navigation";
import {Flex, Group, Text, Stack, Card,
  SimpleGrid,
  Loader,
  Image,
  Button,} from '@mantine/core';
import { ViewsCard } from "@/app/ui/admin/ViewsCard";
import {People, CalendarDate, PersonFill} from "react-bootstrap-icons";
import Link from "next/link";
import { getRecentUserReviews } from "@/lib/actions";

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

export default function DashboardPage() {

  const contextData = useContext(AuthContext);
  const [posts, setPosts] = useState<RecentPostItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  if(!contextData) redirect("/login");

  useEffect(() => {
    async function loadRecentPosts() {
      const res = await getRecentUserReviews(5);
      if (res.success && res.data) {
        setPosts(res.data as unknown as RecentPostItem[]);
      }
      setIsLoading(false);
    }
    loadRecentPosts();
  }, []);

  return (
    <>
      <h1>Welcome,  {contextData.user.name}!</h1>
      
      <Flex 
      mih={500}
      gap="xs"
      justify="left"
      align="left"
      direction="column"
      wrap="wrap"
      >
        <Flex 
        mih={250} 
        w={"100%"}
        gap="xl"
        direction="row"
        wrap="wrap" >
          <ViewsCard />
          <Group gap={"xl"} wrap={"nowrap"} justify={"center"} align = {"center"} w={"20%"} maw={440}
          style={{
							'borderStyle': 'solid',
							'borderWidth': '3px',
							padding: '5px',
							borderRadius: "12px",
							boxShadow: "0px 0px 15px rgba(0, 0, 0, 0.2)",
					}}>
          	<Stack gap = {5} align = "center">
							<People size={40}/>
							<Text size = "xl" fw = {500}>
								100
							</Text>
							<Text size = "xl" fw = {400}>
								Active Members
							</Text>
						</Stack>
          </Group>
        </Flex>

        <Flex 
        mih={250} 
        w={"100%"}
        gap="xl"
        direction="row"
        wrap="wrap" >
          <Group gap={"xl"} wrap={"nowrap"} justify={"center"} align = {"center"} w={"33%"}
          style={{'borderStyle': 'solid', 'borderWidth': '3px', padding: '5px', borderRadius: "12px"}}>
            Box 3
          </Group>
          <Group gap={"xl"} wrap={"nowrap"} justify={"center"} align = {"center"} w={"30%"}
          style={{'borderStyle': 'solid', 'borderWidth': '3px', padding: '5px', borderRadius: "12px"}}>
            Box 4
          </Group>
          <Group gap={"xl"} wrap={"nowrap"} justify={"center"} align = {"center"} w={"30%"}
          style={{'borderStyle': 'solid', 'borderWidth': '3px', padding: '5px', borderRadius: "12px"}}>
            Box 5
          </Group>
        </Flex>
      </Flex>

      <h2>Recent Reviews</h2>

      {isLoading ? (
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
                      post.title
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
                component={Link}
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