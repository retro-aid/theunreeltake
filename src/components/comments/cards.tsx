"use client";

import {Button, Card, Group, Text, Title} from "@mantine/core";
import {deleteCommentAction} from "@/lib/actions/comment-actions";
import {redirect} from "next/navigation";
import {CulledAdminComment, CulledComment} from "@/lib/dal/dto/comments";
import dayjs from "dayjs";



export function AdminCommentCard(
  { comment }: { comment: CulledAdminComment }
) {

  return (
    <Card withBorder>

      <Title order={3}>Blog Post Title</Title>
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
        <Button miw={100} color={"red"} onClick={async () => await deleteCommentAction(comment.id)}>Delete</Button>
      </Group>

    </Card>
  );
}



export function CommentCard(
  { comment }: { comment: CulledComment }
) {

  return (
    <Card withBorder shadow={"none"}>

      <Group justify={"space-between"} mx={"xs"}>
        <Text size={"sm"} fw={600}>{comment.username ?? "Anonymous User"} ({comment.userId.substring(0, 10)})</Text>
        <Text size={"sm"} fw={600}>{dayjs(comment.createdAt).format("MMM DD, YYYY h:mmA")}</Text>
      </Group>



      <Card.Section py={"xs"} m={"xs"} withBorder>
        <Text size={"sm"}>
          {comment.messageContent}
        </Text>
      </Card.Section>

    </Card>
  );
}