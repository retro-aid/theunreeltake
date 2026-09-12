"use client"

import { Text, Card, Image, Box, Group, ActionIcon, Grid, Badge, Tooltip, Button } from "@mantine/core";
import Link from "next/link";
import React, { useState } from "react";
import { DeletePostModal } from "./DeletePostModal";
import { deletePost } from "@/lib/actions";
import { Post } from "@/generated/prisma/client";

/*export type Post = {
    id: string;
    imageSrc: string;
    published: boolean;
    title: string;
}*/

type GridProps = {
    data: Post[];
    icons: Icons;
};

type Icons = {
    Edit: React.ElementType;
    Chat: React.ElementType;
    Stats: React.ElementType;
    Delete: React.ElementType;
}

export function PostCard({post, icons}: {post: Post; icons: Icons}) {
    const [opened, setOpened] = useState(false);
    const onConfirm = async () => {
        await deletePost(post.id);
        setOpened(false);
    }
    return (
        <>
            <Card
                shadow={"sm"}
                padding={"lg"}
                w={"249"}
                h={"267"}
                withBorder>
                <Card.Section>
                    <Box
                        p="xs">
                        <Text
                            fz="18"
                            fw="700"
                            mt={"5"}
                            ml={"10"}
                            truncate='end'>
                            {post.title}
                        </Text>
                    {!post.published && (
                        <Badge
                            color="red"
                            pos="absolute"
                            mt={"10"}
                            ml={"160"}
                            variant="filled"
                            >
                                DRAFT
                        </Badge>)}
                        <Image
                            alt={"Post Card"}
                            bdrs={"xs"}
                            h={"122"} 
                            w={"217"}
                            mt={"5"}
                            mx={"5"}
                            src={post.posterUrl || "https://placehold.co/600x400?text=No+Poster"} />

                        <Group
                            style={{
                                position: 'absolute',
                                bottom: 59,
                                left: 15
                            }}
                            gap={10}>
                            <Tooltip label="Edit Post">
                            <ActionIcon
                                component={Link}
                                href={`/dashboard/posts/edit/${post.id}`}
                                variant={"filled"}
                                size={"md"}
                                bdrs={"xs"}
                                color={"black"}>
                                <icons.Edit size={16}/>
                            </ActionIcon>
                            </Tooltip>
                            <Tooltip label="Comments">
                            <ActionIcon
                                variant={"light"}
                                size={"md"}
                                bdrs={"xs"}
                                color={"black"}>
                                <icons.Chat size={16}/>
                            </ActionIcon>
                            </Tooltip>
                            <Tooltip label="Analytics">
                            <ActionIcon
                                variant={"light"}
                                size={"md"}
                                bdrs={"xs"}
                                color={"black"}>
                                <icons.Stats size={16}/>
                            </ActionIcon>
                            </Tooltip>
                        </Group>
                            <Tooltip label="Delete Post">
                            <ActionIcon
                                variant={"filled"}
                                size={"md"}
                                bdrs={"xs"}
                                color={"red"}
                                mx={"195"}
                                mt={"8"}
                                onClick={() => setOpened(true)}>
                                <icons.Delete size={16}/>
                            </ActionIcon>
                            </Tooltip>
                        <Button
                            fullWidth
                            variant="filled"
                            mt={"8"}
                            bdrs="xs"
                            color={post.published ? "red" : "green"}>
                                {post.published ? "Unpublish" : "Publish"}
                        </Button>
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

export function PostGrid({ data, icons }: GridProps) {
    return (
        <Grid>
            {data.map((post) => (
                <Grid.Col
                    key={post.id}
                    style={{ minWidth: 300 }}
                    span={{ base: 12, sm: 6, md: 3}}>
                        <PostCard post={post} icons={icons}/>
                </Grid.Col>
            ))}
        </Grid>
    )
}