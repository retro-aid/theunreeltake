import { Facebook, Instagram, TwitterX, Youtube } from "react-bootstrap-icons";
import { ActionIcon, Flex, Group } from "@mantine/core";

const socialMediaLinks = [
  {
    label: "Youtube",
    icon: Youtube,
    link: "https://www.youtube.com",
    gradient: { from: "red", to: "pink", deg: 120 },
  },
  {
    label: "TwitterX",
    icon: TwitterX,
    link: "https://www.x.com",
    gradient: { from: "black", to: "gray", deg: 120 },
  },
  {
    label: "Instagram",
    icon: Instagram,
    link: "https://www.instagram.com",
    gradient: { from: "red", to: "yellow", deg: 120 },
  },
  {
    label: "Facebook",
    icon: Facebook,
    link: "https://www.facebook.com",
    gradient: { from: "indigo", to: "blue", deg: 120 },
  },
];

export function SocialMediaLinks() {
  const socialMediaIcons = socialMediaLinks.map((item) => {
    const Icon = item.icon;

    return (
      <ActionIcon
        gradient={item.gradient}
        key={item.label}
        component={"a"}
        href={item.link}
        target={"_blank"}
        variant={"subtle"}
        color="white"
        size={"lg"}
        radius={"md"}
        aria-label={item.label}
      >
        <Icon size={20} />
      </ActionIcon>
    );
  });

  return (
    <Flex
      h={"100%"}
      w={"100%"}
      align={"center"}
      justify={"flex-end"}
      pr={{ base: "none", md: "md" }}
      wrap={"nowrap"}
    >
      <Group gap={"md"}>{socialMediaIcons}</Group>
    </Flex>
  );
}
