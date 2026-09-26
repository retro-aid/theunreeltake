"use client";

import {Button, Card, Group, Loader, Stack, Text, Title, Tooltip} from "@mantine/core";
import {deleteCommentAction, getAmountOfCommentsAction, postReplyAction} from "@/lib/actions/comment-actions";
import {redirect} from "next/navigation";
import {CulledAdminComment, CulledComment} from "@/lib/dal/dto/comments";
import dayjs from "dayjs";
import {DeleteActionModal, ReplyActionModal} from "@/components/generic/modals";
import {useDisclosure} from "@mantine/hooks";
import {useEffect, useState, useTransition} from "react";
import {Chat} from "react-bootstrap-icons";
import { authClient } from "@/lib/auth-client";



export function AdminCommentCard(
  { comment }: { comment: CulledAdminComment }
) {

  const [opened, {open, close}] = useDisclosure(false);

  return (
    <>

      <DeleteActionModal
        title={"Delete Comment?"}
        description={"This action cannot be undone!"}
        opened={opened}
        onClose={close}
        onConfirm={async () => await deleteCommentAction(comment.id)}
      />

      <Card withBorder>

        <Title order={3}>{comment.post.title}</Title>
        <Text size={"sm"} fw={600}>{dayjs(comment.createdAt).format("MMM DD, YYYY h:mm A")}</Text>
        <Text size={"sm"}>User Name: {comment.username ?? "Anonymous User"}</Text>
        <Text size={"sm"}>User Email: {comment.email ?? "No email given"}</Text>
        <Text size={"sm"}>User ID: {comment.userId}</Text>

        <Card.Section p={"md"}>
          <Title order={5}>Message</Title>
          <Text>
            {comment.messageContent}
          </Text>
        </Card.Section>

        <Group gap={"sm"}>
          <Button miw={100} onClick={() => redirect(`/blog/${comment.postSlug}`)}>View Post</Button>
          <Button miw={100} color={"green"}>Reply</Button>
          <Button miw={100} color={"red"} onClick={open}>Delete</Button>
        </Group>

      </Card>
    </>
  );
}



export function CommentCard(
  { comment, isReply = false }: { comment: CulledComment; isReply? : boolean }
) {
  const { data: session } = authClient.useSession();
  const [replyOpened, {open: openReply, close: closeReply}] = useDisclosure(false);
  const canReply = !isReply;

  return (
    <Stack gap={isReply ? 0 : "sm"}>
    <Card 
      withBorder 
      shadow={"none"} 
      ml={isReply ? "xl" : undefined}
      style={isReply ? { borderLeft: "3px solid var(--mantine-color-green-6)" } : undefined}>

      <Group justify={"space-between"} mx={"xs"}>
        <Text size={"sm"} fw={600}>{comment.username ?? "Anonymous User"} ({comment.userId.substring(0, 10)})</Text>
        <Text size={"sm"} fw={600}>{dayjs(comment.createdAt).format("MMM DD, YYYY h:mm A")}</Text>
      </Group>

      <Card.Section py={"xs"} m={"xs"} withBorder>
        <Text size={"sm"}>
          {comment.messageContent}
        </Text>
      </Card.Section>

      {canReply && (
          <Group justify={"flex-end"} mx={"xs"}>
            <Tooltip label={session?.user ? undefined : "Sign in to reply to comments"} disabled={!!session?.user}>
            <Button size={"compact-xs"} variant={"subtle"} color={"green"} onClick={openReply} disabled={!session?.user}>
              Reply
            </Button>
            </Tooltip>
          </Group>
      )}

    </Card>
    {canReply && (
        <ReplyActionModal
          opened={replyOpened}
          onClose={closeReply}
          onConfirm={async (message) => {
            await postReplyAction(comment.postSlug, comment.id, message);
            closeReply();
          }}
        />
      )}

      {comment.repliesReceived && comment.repliesReceived.length > 0 && (
        <Stack gap={"xs"} mt={"xs"}>
          {comment.repliesReceived.map((reply) => (
            <CommentCard key={reply.id} comment={reply} isReply />
          ))}
        </Stack>
      )}
    </Stack>
  );
}



export function AmountCommentsCard() {

  const [isLoading, startTransition] = useTransition();
  const [amountComments, setAmountComments] = useState(0);

  useEffect(() => {

    startTransition(async () => {
      const amount = await getAmountOfCommentsAction("month");
      setAmountComments(amount);
    });

  }, []);


  return (
    <Card withBorder bd={"1px solid gray.6"} shadow={"sm"} w={250} mah={150}>
      <Stack gap={4} align={"center"} justify={"center"} h={"100%"}>
        <Chat size={28}/>
        <Text fw={700} size={"2rem"}>
          {isLoading ? <Loader size={"sm"}/> : amountComments}
        </Text>
        <Text size={"sm"} c={"dimmed"}>
          Comments in the last month
        </Text>
      </Stack>
    </Card>
  );
}