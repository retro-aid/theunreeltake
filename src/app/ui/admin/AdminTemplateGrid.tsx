"use client"

import { Text, Card, Box, Group, ActionIcon, Grid, Tooltip, Divider, Badge } from "@mantine/core";
import Link from "next/link";
import React, { useState } from "react";
import { DeletePostModal } from "./DeletePostModal";
import { PostTemplate } from "@/generated/prisma/client";
import { deletePostTemplateAction } from "@/lib/actions/template-actions";

type GridProps = {
    data: PostTemplate[];
    icons: Icons;
};

type Icons = {
    Edit: React.ElementType;
    Chat: React.ElementType;
    Stats: React.ElementType;
    Delete: React.ElementType;
}

export function PostCard({template, icons}: {template: PostTemplate; icons: Icons}) {
    const [opened, setOpened] = useState(false);
    const onConfirm = async () => {
        await deletePostTemplateAction(template.id);
        setOpened(false);
    }
    return (
        <>
            <Card
                shadow={"sm"}
                padding={"lg"}
                w={"249"}
                h={"242"}
                withBorder>
                <Card.Section>
                    <Box
                        p="xs">
                        
                        {!template.isPublic && (
                            <Badge
                                color="red"
                                pos="absolute"
                                mt={"192"}
                                ml={"15"}
                                variant="filled"
                            >
                                Private
                            </Badge>)}
                            {template.isPublic && (
                            <Badge
                                color="green"
                                pos="absolute"
                                mt={"192"}
                                ml={"15"}
                                variant="filled"
                            >
                                Public
                            </Badge>)}
                        
                        <Text
                            fz="20"
                            fw="700"
                            mt={"5"}
                            ml={"10"}
                            ta={"center"}
                            truncate='end'>
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
                                textWrap: 'balance'
                            }}>
                            {template.description}
                        </Text>

                        <Group
                            style={{
                                position: 'absolute',
                                bottom: 15,
                                right: 15
                            }}
                            gap={10}>

                            <Tooltip label="Edit Template">
                            <ActionIcon
                                component={Link}
                                href={`/dashboard/templates/edit/${template.id}`}
                                variant={"filled"}
                                size={"md"}
                                bdrs={"xs"}
                                color={"black"}>
                                
                                <icons.Edit size={16}/>
                            </ActionIcon>
                            </Tooltip>
                        
                            <Tooltip label="Delete Template">
                            <ActionIcon
                                variant={"filled"}
                                size={"md"}
                                bdrs={"xs"}
                                color={"red"}
                                onClick={() => setOpened(true)}>
                                <icons.Delete size={16}/>
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

export function TemplateGrid({ data, icons }: GridProps) {
    return (
        <Grid>
            {data.map((template) => (
                <Grid.Col
                    key={template.id}
                    style={{ minWidth: 250 }}
                    span={{ base: 12, sm: 6, md: 3}}>
                        <PostCard template={template} icons={icons}/>
                </Grid.Col>
            ))}
        </Grid>
    )
}