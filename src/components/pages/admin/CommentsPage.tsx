import {
  Flex,
  Title
} from "@mantine/core";
import {getAdminCommentsAction} from "@/lib/actions/comment-actions";
import {AdminCommentGrid} from "@/components/comments";

export default async function CommentsPage() {

  const comments = await getAdminCommentsAction();

  return (
    <Flex direction={"column"} h={"calc(100vh - 32px)"}>

      <Title mb={"lg"}>Recent Comments</Title>

      <AdminCommentGrid comments={comments}/>

    </Flex>
  );
}