"use client";

import { useEffect, useState } from "react";
import { ActionIcon, Menu, Text, Tooltip } from "@mantine/core";
import { Funnel, Filter } from "react-bootstrap-icons";
import { getAllTags } from "@/lib/actions";
import { AllowedTagType } from "@/lib/constants";
import { Tag } from "@/generated/prisma/client";

export default function RequestActionButtons({
    onSortByAction,
    onFilterByTypeAction,
}: {
    onSortByAction: (value: string) => void;
    onFilterByTypeAction: (value: string) => void;
}) {
    const [mediaTags, setMediaTags] = useState<Tag[]>([]);

    useEffect(() => {
        getAllTags(AllowedTagType.Media).then((result) => {
            if (result.data) setMediaTags(result.data);
        });
    }, []);

    return (
    <>
      <Menu transitionProps={{ transition: "pop-top-left" }} position="bottom-start">
        <Menu.Target>
          <Tooltip label="Filter By Type">
            <ActionIcon color="dark" size="lg" variant="outline" aria-label="Filter Button">
              <Funnel size={22} />
            </ActionIcon>
          </Tooltip>
        </Menu.Target>
        <Menu.Dropdown>
          <Menu.Label>Media Type</Menu.Label>
          {mediaTags.map((tag) => (
            <Menu.Item key={tag.id} onClick={() => onFilterByTypeAction(tag.displayName)}>
              <Text>{tag.displayName}</Text>
            </Menu.Item>
          ))}
          <Menu.Item onClick={() => onFilterByTypeAction("")}>
            <Text>Clear</Text>
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>

      <Menu transitionProps={{ transition: "pop-top-left" }} position="bottom-start">
        <Menu.Target>
          <Tooltip label="Sort By">
            <ActionIcon color="dark" size="lg" variant="outline" aria-label="Sort Button">
              <Filter size={22} />
            </ActionIcon>
          </Tooltip>
        </Menu.Target>
        <Menu.Dropdown>
          <Menu.Label>Sort By</Menu.Label>
          <Menu.Item onClick={() => onSortByAction("title")}><Text>Title</Text></Menu.Item>
          <Menu.Item onClick={() => onSortByAction("name")}><Text>Requester</Text></Menu.Item>
          <Menu.Item onClick={() => onSortByAction("email")}><Text>Email</Text></Menu.Item>
          <Menu.Item onClick={() => onSortByAction("")}><Text>Clear</Text></Menu.Item>
        </Menu.Dropdown>
      </Menu>
    </>
    );
}
