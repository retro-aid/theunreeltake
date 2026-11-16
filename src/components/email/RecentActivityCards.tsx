import { resend } from "@/lib/dal/dto/email/resend";
import {
  ActionIcon,
  Group,
  NumberFormatter,
  Paper,
  Popover,
  PopoverDropdown,
  PopoverTarget,
  SimpleGrid,
  Skeleton,
  Text,
} from "@mantine/core";
import { QuestionCircle } from "react-bootstrap-icons";
import { EmailMetric } from "resend";

interface CardData {
  metric: EmailMetric;
  label: string;
  type: "percentage" | "integer";
  description: string;
}

const cardData: CardData[] = [
  {
    metric: "delivery_rate",
    label: "Delivery Rate",
    type: "percentage",
    description:
      "The rate that an email was sent and accepted by a recipient's mail server",
  },
  {
    metric: "bounce_rate",
    label: "Bounce Rate",
    type: "percentage",
    description:
      "The rate that an email was sent but was rejected by a recipient's mail server",
  },
  {
    metric: "open_rate",
    label: "Open Rate",
    type: "percentage",
    description:
      "The rate that a recipient opened an email. Only counts unique opens",
  },
  {
    metric: "click_rate",
    label: "Clicked Rate",
    type: "percentage",
    description:
      "The rate recipients clicked an embedded link. Only counts unique clicks",
  },
  {
    metric: "unsubscribed",
    label: "Unsubscribed",
    type: "integer",
    description: "The number of recipients that are unsubscribed",
  },
  {
    metric: "complained",
    label: "Complaints",
    type: "integer",
    description:
      "The number of recipients who marked the delivered email as spam",
  },
];

export async function RecentActivityCards() {
  const metrics = await resend.emails.metrics({
    metrics: cardData.map((c) => c.metric),
  });

  if (metrics.error || !metrics.data) return "Error loading metrics";

  const renderedCards = Object.entries(metrics.data.totals).map(
    (metric, index) => {
      const [name, value] = metric;

      return (
        <RecentActivityCard
          key={name}
          label={cardData.at(index)?.label ?? ""}
          description={cardData.at(index)?.description ?? ""}
          value={value}
          type={cardData.at(index)?.type ?? "integer"}
        />
      );
    },
  );

  return (
    <SimpleGrid cols={{ base: 1, md: 2 }} ta={"center"} c={"gray.9"}>
      {renderedCards}
    </SimpleGrid>
  );
}

export function RecentActivityCard({
  label,
  description,
  value,
  type,
}: {
  label: string;
  description: string;
  value: number;
  type: "percentage" | "integer";
}) {
  const isInt = type === "integer";

  const FormattedNumber = (
    <NumberFormatter
      value={isInt ? value : value.toFixed(1)}
      decimalScale={isInt ? undefined : 1}
      suffix={isInt ? undefined : "%"}
    />
  );

  return (
    <Paper
      p={"xs"}
      bd={"1px solid gray.3"}
      bdrs={"md"}
      h={"6.5rem"}
      shadow={"xs"}
    >
      <Group gap={0} wrap={"nowrap"}>
        <Text w={"100%"} fw={500} fz={"1.125rem"}>
          {label}
        </Text>

        <Popover position={"bottom"} withArrow>
          <PopoverTarget>
            <ActionIcon variant={"subtle"} color={"gray"} size={"xs"} ml={-18}>
              <QuestionCircle size={14} />
            </ActionIcon>
          </PopoverTarget>

          <PopoverDropdown w={200} bg={"gray.1"}>
            <Text size={"xs"}>{description}</Text>
          </PopoverDropdown>
        </Popover>
      </Group>
      <Text w={"100%"} fw={500} fz={"2rem"}>
        {FormattedNumber}
      </Text>
    </Paper>
  );
}

export function RecentActivityCardsSkeleton() {
  const skeletonCards = Array.from({ length: cardData.length }, (_, index) => (
    <Skeleton key={index} height={"6.5rem"} />
  ));

  return (
    <SimpleGrid cols={{ base: 1, md: 2 }} ta={"center"} c={"gray.9"}>
      {skeletonCards}
    </SimpleGrid>
  );
}
