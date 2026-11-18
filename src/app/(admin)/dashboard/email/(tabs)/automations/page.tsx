import {
  AutomationsList,
  AutomationsListSkeleton,
} from "@/components/email/AutomationsList";
import { Container, Title } from "@mantine/core";
import { Suspense } from "react";

export default function Page() {
  return (
    <Container>
      <Title order={3} mb={"md"}>
        Automations Configuration
      </Title>
      <Suspense fallback={<AutomationsListSkeleton />}>
        <AutomationsList />
      </Suspense>
    </Container>
  );
}
