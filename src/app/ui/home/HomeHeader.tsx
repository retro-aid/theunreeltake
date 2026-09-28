"use client";

import NextImage from "next/image";

import { Image, Flex } from "@mantine/core";
import { HomeBurgerMenu } from "@/app/ui/home/HomeBurgerMenu";
import { WebNavLinks } from "@/app/ui/home/WebNavLinks";
import { HomeHeaderButtons } from "@/app/ui/home/HomeHeaderButtons";

export function HomeHeader() {
  return (
    <Flex align={"center"} px="md" py="md" w={"100%"} gap="xl" bg={"dark"}>
      <Flex
        justify={{ base: "center", lg: "end" }}
        w={"25%"}
        visibleFrom={"sm"}
      >
        <Image
          component={NextImage}
          width={128}
          height={48}
          loading={"eager"}
          src={"/img/white_logo_transparent_background.png"}
          w={128}
          h={48}
          alt={"Unreel Take Logo"}
        />
      </Flex>

      <Flex justify={"center"} align={"center"} w={"100%"} hiddenFrom={"sm"}>
        <HomeBurgerMenu />
        <Flex w={"100%"} justify={"center"} pr={34}>
          <Image
            src={"/img/white_logo_transparent_background.png"}
            w={128}
            h={48}
            alt={"Unreel Take Logo"}
          />
        </Flex>
      </Flex>

      <Flex visibleFrom={"sm"} w={"50%"}>
        <WebNavLinks />
      </Flex>

      <Flex
        justify={{ base: "center", lg: "start" }}
        w={"25%"}
        visibleFrom={"sm"}
      >
        <HomeHeaderButtons />
      </Flex>
    </Flex>
  );
}
