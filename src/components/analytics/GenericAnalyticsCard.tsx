"use client";

import {useEffect, useState, useTransition} from "react";
import {Card, Loader, Stack, Text} from "@mantine/core";
import {Icon as ReactBootstrapIcon} from "react-bootstrap-icons";

type GenericAnalyticsCardProps = {
  icon: ReactBootstrapIcon,
  subtitle?: string,
  onFetchDataAction?: () => Promise<number>;
};

export default function GenericAnalyticsCard(
  props: GenericAnalyticsCardProps
) {

  const [isLoading, startTransition] = useTransition();
  const [value, setValue] = useState(0);

  useEffect(() => {

    startTransition(async () => {
      
      if(!props.onFetchDataAction) return;
      
      const v = await props.onFetchDataAction() ?? 0;

      setValue(v);
    });

  }, [props]);

  return (
    <Card
      withBorder
      bd={"1px solid gray.6"}
      shadow={"sm"}
      w={250}
      mah={150}
    >
      <Stack
        gap={4}
        align={"center"}
        justify={"center"}
        h={"100%"}
      >
        <props.icon size={28}/>
        <Text fw={700} size={"2rem"}>
          {isLoading ? <Loader size={"sm"}/> : value}
        </Text>
        <Text size={"sm"} c={"dimmed"}>
          {props.subtitle}
        </Text>
      </Stack>
    </Card>
  );
  
}