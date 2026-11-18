import { Flex, Grid, GridCol, Skeleton, Stack, Title } from "@mantine/core";
import { Suspense } from "react";
import { RecentBroadcasts } from "@/components/email";
import {
  RecentActivityCards,
  RecentActivityCardsSkeleton,
} from "@/components/email/RecentActivityCards";

export function EmailPage() {
  return (
    <Grid columns={12}>
      <GridCol span={{ base: 12, lg: 6 }} bd={"1px solid gray.3"} bdrs={"md"}>
        <Stack p={"lg"} h={"100%"}>
          <Title order={3}>Overview</Title>

          <Flex direction={"column"} justify={"center"} flex={1}>
            <Suspense fallback={<RecentActivityCardsSkeleton />}>
              <RecentActivityCards />
            </Suspense>
          </Flex>
        </Stack>
      </GridCol>

      <GridCol span={{ base: 12, lg: 6 }} bd={"1px solid gray.3"} bdrs={"md"}>
        <Stack p={"lg"}>
          <Title order={3}>Recent Broadcasts</Title>
          <Suspense fallback={<Skeleton width={"100%"} height={"22rem"} />}>
            <RecentBroadcasts />
          </Suspense>
        </Stack>
      </GridCol>
    </Grid>
  );
}
