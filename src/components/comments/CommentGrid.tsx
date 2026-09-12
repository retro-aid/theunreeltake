import {CulledComment} from "@/lib/dal/dto/comments";
import {ScrollArea, Stack} from "@mantine/core";
import {CommentCard} from "@/components/comments/cards";

export default function CommentGrid(
  { comments }: { comments: CulledComment[] }
) {

  return (
    <ScrollArea bd={"1px solid gray.3"} p={"lg"} bdrs={"md"} h={700}>
      <Stack>
        {comments.map((item, index) =>
          <CommentCard key={index} comment={item}/>
        )}
      </Stack>
    </ScrollArea>
  );
}