'use client';

import {ActionIcon, Checkbox, Menu, MultiSelect, Text, Tooltip} from "@mantine/core";
import {CardText, Funnel} from "react-bootstrap-icons";
import {allowedPostsPerPage} from "@/lib/constants";
import { getTagsAction } from "@/lib/actions/catalog-actions";
import { useEffect, useState, useTransition } from "react";

type tag = {
  id: number,
  type: string,
  displayName: string
}

const tagList: string[] = [];

export default function CatalogActionButtons(
  {
    onSortByAction,
    onFilterAction,
    onPostsCountAction
  }: {
    onSortByAction: (value: string) => void
    onFilterAction: (value: string[]) => void
    onPostsCountAction: (value: number) => void
  }

) {

  const [tags, setTags] = useState<tag[]>();
  const [isLoading, startTransition] = useTransition();

  useEffect(() => {
      startTransition(async () => {
        const data = await getTagsAction();
        setTags(data);
      });
    }, []);

  let handleArray = (id: number) =>{
    for (let i = 0; i < tagList.length; i++)
    {
      if(tagList[i] === id.toString()){
        tagList.splice(i, i+1)
        onFilterAction(tagList)
        return
      } 
    }
    tagList.push(id.toString())
    onFilterAction(tagList)
    return
  }

  const checkBool = (id: number) =>{
    for (let i = 0; i < tagList.length; i++)
      if(tagList[i] === id.toString())
        return true
    return false
  }
  return (
    <>

    <Menu
      transitionProps={{transition: "pop-top-left"}}
      position={"bottom-start"}>

      <Menu.Target>
        <Tooltip label={"Sort By"}>
          <ActionIcon
            color={"dark"}
            size={"lg"}
            variant={"outline"}>
            <Funnel size={22}/>
          </ActionIcon>
        </Tooltip>
      </Menu.Target>

      <Menu.Dropdown>

        <Menu.Label>Sort By</Menu.Label>

        <Menu.Item onClick={() => onSortByAction("date")}>
          <Text>Date</Text>
        </Menu.Item>

        <Menu.Item onClick={() => onSortByAction("")}>
          <Text>Clear</Text>
        </Menu.Item>

      </Menu.Dropdown>

    </Menu>

    <Menu
      transitionProps={{transition: "pop-top-left"}}
      position={"bottom-start"}>

      <Menu.Target>
        <Tooltip label={"Filter by"}>
          <ActionIcon
            variant={"outline"}
            color={"dark"}
            radius={"lg"}
            aria-label={"Filter Button"}>
            <Funnel size={22}/>
          </ActionIcon>
        </Tooltip>
      </Menu.Target>
      
      <Menu.Dropdown>
          {tags == undefined ? (
          <Menu.Item>
            <Text>
              None
            </Text>
          </Menu.Item>
          ) : (
            (tags).map((value) => (
              <Checkbox 
              key={value.id}  
              onChange={() => handleArray(value.id)} 
              label={value.displayName}
              checked={checkBool(value.id)}
              />
            ))
            )}
      </Menu.Dropdown>
    </Menu>

    <Menu
      transitionProps={{transition: "pop-top-left"}}
      position={"bottom-start"}>

      <Menu.Target>
        <Tooltip label={"Posts Per Page"}>
          <ActionIcon
            color={"dark"}
            size={"lg"}
            variant={"outline"}>
            <CardText size={22}/>
          </ActionIcon>
        </Tooltip>
      </Menu.Target>

      <Menu.Dropdown>

        <Menu.Label>Count</Menu.Label>

        {allowedPostsPerPage.map((value, index) => {
          return (
            <Menu.Item key={index} onClick={() => onPostsCountAction(value)}>
              <Text>{value.toString()}</Text>
            </Menu.Item>
          )
        })}

      </Menu.Dropdown>

    </Menu>

    </>
  );

}
