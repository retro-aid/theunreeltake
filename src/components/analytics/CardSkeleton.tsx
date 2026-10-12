import { Card, Skeleton, Stack } from "@mantine/core";

export function CardSkeleton() {
  return (
    <Card withBorder bd={"1px solid gray.5"} shadow={"sm"} miw={250} mah={150}>
      <Stack gap={4} align={"center"} justify={"center"} h={"100%"}>
        <Skeleton w={50} h={25} bdrs={"xs"} />
        <Skeleton w={50} h={40} bdrs={"xs"} />
        <Skeleton w={125} h={10} bdrs={"xs"} />
      </Stack>
    </Card>
  );
}
