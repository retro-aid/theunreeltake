'use client';

import { Card, CardSection, Group, Text, Menu, ActionIcon, Image, Button } from "@mantine/core";
import { ThreeDots, Trash, PencilSquare, PlusSquare } from "react-bootstrap-icons";

export default function TemplatePage() {

    return (
        <div style={{ padding: "0 40px"}}>
            <h1>Templates</h1>
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

                    {/* Image of Movie or book */}
                    <CardSection mt="sm">
                        <Image src="https://t4.ftcdn.net/jpg/06/57/37/01/360_F_657370150_pdNeG5pjI976ZasVbKN9VqH1rfoykdYU.jpg"></Image>
                    </CardSection>

                    <CardSection>
                        {/* Add Movie Name:, Rating:, Summary:, Review: */}
                        <Text>Movie Name:</Text>
                    </CardSection>

                </Card>
                </Group>
        </div>
    );
}