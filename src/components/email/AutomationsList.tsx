import { list as listAutomations } from "@/lib/actions/email/automations-actions";
import { Box, EmptyState, ScrollArea, Skeleton, Stack } from "@mantine/core";
import { ExclamationOctagon } from "react-bootstrap-icons";
import { AutomationFormCard } from "@/components/email/AutomationFormCard";

export async function AutomationsList() {
  const { error, data } = await listAutomations();

  if (error || !data) return error.message;

  const renderedItems = data.map((automation, index) => (
    <AutomationFormCard key={index} item={automation} />
  ));

  return (
    <ScrollArea w={"100%"} h={"41.5rem"} bd={"1px solid gray.5"} bdrs={"md"}>
      {data.length === 0 ? (
        <EmptyState
          mt={"xl"}
          icon={<ExclamationOctagon />}
          title={"No automations are configured"}
          description={
            "It looks like there aren't any automations configured on Resend. " +
            "If you believe this is an error, please contact the server administrator"
          }
        />
      ) : (
        <Stack p={"md"}>{renderedItems}</Stack>
      )}
    </ScrollArea>
  );
}

export function AutomationsListSkeleton() {
  const renderedItems = Array.from({ length: 7 }, (_, i) => i).map((_, i) => (
    <Skeleton key={i} height={"4.5rem"} w={"100%"}></Skeleton>
  ));

  return (
    <Box w={"100%"} h={"41.5rem"} bd={"1px solid gray.5"} bdrs={"md"}>
      <Stack p={"md"}>{renderedItems}</Stack>
    </Box>
  );
}
