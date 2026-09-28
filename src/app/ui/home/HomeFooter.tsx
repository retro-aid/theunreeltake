import { Box, Flex, Title } from "@mantine/core";
import { SocialMediaLinks } from "@/app/ui/home/SocialMediaLinks";
import { WebNavLinks } from "@/app/ui/home/WebNavLinks";
import { Bootstrap } from "react-bootstrap-icons";

export function HomeFooter() {
  return (
    <Flex
      h={"100%"}
      w={"100%"}
      p={"xs"}
      align={"flex-end"}
      direction={"column"}
      style={{ borderStyle: "solid hidden hidden hidden", borderWidth: "1px" }}
    >
      <Flex h={"50%"} w={"inherit"} visibleFrom={"sm"}>
        <Box w={"25%"} h={"100%"}>
          <Flex
            h={"100%"}
            w={"100%"}
            align={"center"}
            justify={"flex-start"}
            pl={{ base: "none", md: "md" }}
            columnGap={8}
          >
            <Bootstrap size={30} />
            <Title order={4} textWrap={"nowrap"}>
              The UnReel Take
            </Title>
          </Flex>
        </Box>

        <Box w={"50%"} h={"100%"}>
          <Flex
            h={"100%"}
            w={"100%"}
            align={"center"}
            justify={"center"}
            px={"xs"}
          >
            {/**Center Media**/}
            <WebNavLinks />
          </Flex>
        </Box>

        {/**For Jalen: Social Media stuff goes here*/}
        <Box w={"25%"} h={"100%"}>
          <Flex
            h={"100%"}
            w={"100%"}
            align={"right"}
            justify={"center"}
            px={"xs"}
          >
            {/**Right Media**/}
            <SocialMediaLinks></SocialMediaLinks>
          </Flex>
        </Box>
      </Flex>
    </Flex>
  );
}
