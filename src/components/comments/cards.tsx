"use client";

import {Button, Card, Group, Text, Title} from "@mantine/core";
import {deleteCommentAction} from "@/lib/actions/comment-actions";
import {redirect} from "next/navigation";
import {CulledAdminComment, CulledComment} from "@/lib/dal/dto/comments";
import dayjs from "dayjs";
import {DeleteActionModal} from "@/components/generic/modals";
import {useDisclosure} from "@mantine/hooks";



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
  { comment }: { comment: CulledComment }
) {

  return (
    <Card withBorder shadow={"none"}>

      <Group justify={"space-between"} mx={"xs"}>
        <Text size={"sm"} fw={600}>{comment.username ?? "Anonymous User"} ({comment.userId.substring(0, 10)})</Text>
        <Text size={"sm"} fw={600}>{dayjs(comment.createdAt).format("MMM DD, YYYY h:mm A")}</Text>
      </Group>

      <Card.Section py={"xs"} m={"xs"} withBorder>
        <Text size={"sm"}>
          {comment.messageContent}
        </Text>
      </Card.Section>

    </Card>
  );
}