import {
  Flex,
  Title
} from "@mantine/core";
import {getAdminCommentsAction} from "@/lib/actions/comment-actions";
import {AdminCommentSearch} from "@/components/comments/";

export async function CommentsPage() {

  const comments = await getAdminCommentsAction();

  return (
    <Flex direction={"column"} h={"calc(100vh - 32px)"}>

      <Title mb={"lg"}>Recent Comments</Title>

      <AdminCommentSearch comments={comments}/>

    </Flex>
  );
}