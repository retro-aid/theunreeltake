import { Box, Container, Stack, Text, Title } from "@mantine/core";
import { getAdminCommentsAction } from "@/lib/actions/comment-actions";
import { AdminCommentSearch } from "@/components/comments/";

/**
 * URT-419: include the container to make the comment display easier
 * - still fetches comments from the server and renders the moderation dashboard
 */
export async function CommentsPage() {
  const comments = await getAdminCommentsAction();

  return (
    <Container
      size="xl"
      py="lg"
      px="md"
      style={{
        height: "700",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Stack gap="md" style={{ flex: 1, minHeight: 0 }}>
        <Box>
          <Title order={2} fw={700}>
            Recent Comments
          </Title>
          <Text size="xs" c="dimmed" mt={2}>
            Moderate and review latest audience feedback
          </Text>
        </Box>

        <AdminCommentSearch comments={comments} />
      </Stack>
    </Container>
  );
}
