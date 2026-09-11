'use client';

import { Card, CardSection, Group, Text, Menu, ActionIcon, Image, Button, Title, Container } from "@mantine/core";
import { ThreeDots, Trash, PencilSquare, PlusSquare } from "react-bootstrap-icons";

export default function TemplatePage() {

    return (
        <Container fluid p="md">
            <Title>Templates</Title>
                <Group justify="flex-end">
                    <Button leftSection={<PlusSquare size={16}></PlusSquare>}>
                        New Template
                    </Button>
                </Group>

                <Group>
                <Card withBorder shadow="sm">
                    <CardSection withBorder inheritPadding py="xs">
                        <Group justify="space-between">
                            <Text size="lg" fw={700}> Movie Review Template </Text>
                            <Menu withinPortal position="bottom-end" shadow="sm">
                                <Menu.Target>
                                    <ActionIcon variant="default">
                                        <ThreeDots size={16}>

                                        </ThreeDots>
                                    </ActionIcon>
                                </Menu.Target>

                                <Menu.Dropdown>
                                    <Menu.Item leftSection={<PencilSquare size={14}></PencilSquare>}>
                                        Edit
                                    </Menu.Item>
                                    <Menu.Item leftSection={<Trash size={14}></Trash>} color="red">
                                        Delete
                                    </Menu.Item>
                                </Menu.Dropdown>
                            </Menu>
                        </Group>
                    </CardSection>
                </Card>
                </Group>
        </Container>
    );
}