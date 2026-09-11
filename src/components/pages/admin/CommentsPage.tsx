import {
  Flex,
  Pagination,
  ScrollArea,
  Stack,
  Title
} from "@mantine/core";
import {AdminCommentCard} from "@/components/comments";
import {getAdminCommentsAction} from "@/lib/actions/comment-actions";

export default async function CommentsPage() {

  const comments = await getAdminCommentsAction();

  return (
    <Flex direction={"column"} h={"calc(100vh - 32px)"}>

      <Title mb={"lg"}>Recent Comments</Title>

      <ScrollArea bd={"1px solid gray.3"} p={"lg"} bdrs={"md"}>
        <Stack>
          {comments.map((item, index) =>
            <AdminCommentCard key={index} comment={item}/>
          )}
        </Stack>
      </ScrollArea>

      <Pagination py={"lg"} siblings={1} total={10}/>

    </Flex>
  );
}