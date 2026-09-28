"use client";

import { Burger, Flex, Drawer, Image, ActionIcon } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { MobileNavLinks } from "@/app/ui/home/MobileNavLinks";
import { X } from "react-bootstrap-icons";

export function HomeBurgerMenu() {
  const [opened, { toggle }] = useDisclosure();

  return (
    <>
      <Flex h={"100%"} px={{ base: "none", md: "md" }}>
        <Burger
          opened={opened}
          onClick={toggle}
          aria-label={"Toggle Navigation Menu"}
          color={"gray.0"}
        />
      </Flex>

      <Drawer.Root opened={opened} onClose={toggle} size={"100%"}>
        <Drawer.Overlay />

        <Drawer.Content bg={"dark.5"}>
          <Drawer.Header bg={"dark"}>
            <Flex w={"100%"} justify={"center"} pl={34}>
              <Image
                src={"/img/white_logo_transparent_background.png"}
                w={128}
                h={48}
                alt={"Unreel Take Logo"}
              />
            </Flex>

            <ActionIcon color={"dark"} size={"lg"} onClick={toggle}>
              <X size={30}></X>
            </ActionIcon>
          </Drawer.Header>

          <Drawer.Body bg={"dark.5"} pt={"md"}>
            <MobileNavLinks />
          </Drawer.Body>
        </Drawer.Content>
      </Drawer.Root>
    </>
  );
}
