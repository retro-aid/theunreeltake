import { Card, Stack, Text } from "@mantine/core";
import { Icon as ReactBootstrapIcon } from "react-bootstrap-icons";

type GenericAnalyticsCardProps = {
  icon: ReactBootstrapIcon;
  subtitle?: string;
  valuePromise: Promise<number>;
};

export default async function GenericAnalyticsCard(
  props: GenericAnalyticsCardProps,
) {
  const value = await props.valuePromise;

  return (
    <Card withBorder bd={"1px solid gray.5"} miw={250} mah={150}>
      <Stack gap={4} align={"center"} justify={"center"} h={"100%"}>
        <props.icon size={28} />
        <Text fw={700} size={"1.75rem"}>
          {value}
        </Text>
        <Text size={"sm"} c={"dimmed"}>
          {props.subtitle}
        </Text>
      </Stack>
    </Card>
  );
}
