"use client";

import {useContext} from "react";
import {AuthContext} from "@/app/ui/admin/AuthContext";
import {redirect} from "next/navigation";
import {Flex, Group} from '@mantine/core';
import { ViewsCard } from "@/app/ui/admin/ViewsCard";

export default function DashboardPage() {

  const contextData = useContext(AuthContext);

  if(!contextData) redirect("/login");

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
          <Group gap={"xl"} wrap={"nowrap"} justify={"center"} align = {"center"} w={"20%"}
          style={{'borderStyle': 'solid', 'borderWidth': '3px', padding: '5px', borderRadius: "12px"}}>
            Box 2
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

      <Flex 
      mih={200}
      gap="xs"
      justify="left"
      align="left"
      direction="column"
      wrap="wrap"
      >
        <Flex 
        mih={190} 
        w={"100%"}
        gap="xl"
        direction="row"
        wrap="wrap" >
          <Group gap={"xl"} wrap={"nowrap"} justify={"center"} align = {"center"} w={"23%"}
          style={{'borderStyle': 'solid', 'borderWidth': '3px', padding: '5px', borderRadius: "12px"}}>
            Review 1
          </Group>
          <Group gap={"xl"} wrap={"nowrap"} justify={"center"} align = {"center"} w={"23%"}
          style={{'borderStyle': 'solid', 'borderWidth': '3px', padding: '5px', borderRadius: "12px"}}>
            Review 2
          </Group>
          <Group gap={"xl"} wrap={"nowrap"} justify={"center"} align = {"center"} w={"23%"}
          style={{'borderStyle': 'solid', 'borderWidth': '3px', padding: '5px', borderRadius: "12px"}}>
            Review 3
          </Group>
          <Group gap={"xl"} wrap={"nowrap"} justify={"center"} align = {"center"} w={"23%"}
          style={{'borderStyle': 'solid', 'borderWidth': '3px', padding: '5px', borderRadius: "12px"}}>
            Review 4
          </Group>
        </Flex>
      </Flex>
    </>
  );

}