"use client";

import { ReactNode } from "react";
import { ActionIcon, Menu, Text, Tooltip } from "@mantine/core";
import { Filter, Funnel } from "react-bootstrap-icons";
import RefreshDataButton from "@/app/ui/home/RefreshDataButton";

export interface ActionMenuOption {
  label: string;
  value: string;
}

export interface ActionMenuConfig {
  label: string;
  options: ActionMenuOption[];
  onSelect: (value: string) => void;
}

function ActionMenu(
  { label, options, onSelect, icon }: ActionMenuConfig & { icon: ReactNode }
) {

  return (
    <Menu transitionProps={{ transition: "pop-top-left" }} position={"bottom-start"}>

      <Menu.Target>
        <Tooltip label={label}>
          <ActionIcon color={"dark"} size={"lg"} variant={"outline"} aria-label={`${label} Button`}>
            {icon}
          </ActionIcon>
        </Tooltip>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Label>{label}</Menu.Label>

        {options.map((option) => (
          <Menu.Item key={option.value} onClick={() => onSelect(option.value)}>
            <Text>{option.label}</Text>
          </Menu.Item>
        ))}

        <Menu.Item onClick={() => onSelect("")}>
          <Text>Clear</Text>
        </Menu.Item>
      </Menu.Dropdown>

    </Menu>
  );
}

export function ActionButtons(
  { sort, filter, onRefresh }: {
    sort?: ActionMenuConfig;
    filter?: ActionMenuConfig;
    onRefresh?: () => void;
  }
) {

  return (
    <>
      {filter && <ActionMenu {...filter} icon={<Funnel size={22}/>} />}
      {sort && <ActionMenu {...sort} icon={<Filter size={22}/>} />}
      {onRefresh && <RefreshDataButton updateData={onRefresh} />}
    </>
  );
}