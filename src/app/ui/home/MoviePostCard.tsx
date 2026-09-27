'use client';

import {
  AspectRatio,
  Badge,
  Card,
  rem,
  Stack,
  Image,
  useMantineTheme,
  ActionIcon,
  Group,
  Text, Button, Flex,
} from '@mantine/core';

import classes from "./MoviePostCard.module.css";

import {CatalogItem} from "@/app/api/catalog/route";
import {useElementSize} from "@mantine/hooks";
import {Flip} from "@gfazioli/mantine-flip";
import {useState} from "react";
import {X} from "react-bootstrap-icons";
import Link from "next/link";
import dayjs from "dayjs";

export function MoviePostCard(
  {
    postData
  }: {
    postData: CatalogItem
  }
) {

  const [isFlipped, setIsFlipped] = useState(false);

  const theme = useMantineTheme();

  const {ref, width} = useElementSize();

  return (
    <AspectRatio ratio={2 / 3} maw={{ base: 250, lg: 300, xl: 400 }} ref={ref}>
      <Flip
        flipped={isFlipped}
        duration={0.6}
      >
        <Card
          className={classes.card}
          w={"100%"}
          h={"100%"}
          shadow={`3px 3px 10px ${theme.colors.gray[9]}`}
          p={0}
          bdrs={"sm"}
          onClick={() => setIsFlipped(true)}
        >
          <Image
            alt={postData.title}
            w={"100%"}
            h={"100%"}
            src={postData.posterUrl ?? `https://placehold.co/200x300?text=${postData.title.split(" ").join("+")}`}
          />
        </Card>

        <Card w={"100%"} h={"100%"} shadow={`3px 3px 10px ${theme.colors.gray[9]}`} bdrs={"sm"} p={"xs"}>

          <Group align={"start"} h={"100%"} wrap={"nowrap"} gap={0}>

            <Flex direction={"column"} w={"100%"} h={"100%"}>

              <Stack align={"stretch"} h={"100%"} pb={"xs"} px={rem(width / 20)} gap={6}>
                
                <Text
                  lh={{ base: "18px", sm: "20px", md: "22px", lg: "24px"}}
                  fz={{base: 16, sm: 18, md: 20, lg: 22}}
                  fw={"bold"}
                  lineClamp={2}
                >
                  {postData.title}
                </Text>

                {/*applied here to map over all tags without crashing */}
                <Group gap={4} wrap="wrap">
                  {postData.tags?.map((t) => (
                    <Badge 
                      key={t.tag.id}
                      bdrs="sm" 
                      color="blue" 
                      variant="light" 
                      style={{
                        fontSize: rem(width / 24), 
                        height: rem(width / 12), 
                        padding: `0 ${rem(8)}` 
                      }}
                    >
                      {t.tag.displayName}
                    </Badge>
                  ))}
                </Group>

                <Text size={rem(width / 16)}>Written By: {postData.author.name}</Text>
                <Text size={rem(width / 16)}>Posted: {dayjs(postData.createdAt).format("MMM D, YYYY")}</Text>

              </Stack>
            </Flex>

            <ActionIcon
              variant={"outline"}
              color={"dark"}
              bdrs={"sm"}
              size={"sm"}
              onClick={() => setIsFlipped(false)}
            >
              <X size={24}></X>
            </ActionIcon>
          </Group>


          <Button
            component={Link}
            href={`/blog/${postData.slug}`}
            prefetch={false}
            size={"sm"}
            color={"dark"}
            bdrs={"sm"}
          >
            View Post
          </Button>
        </Card>
      </Flip>
    </AspectRatio>
  );
}