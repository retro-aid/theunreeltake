import {CulledComment} from "@/lib/dal/dto/comments";
import {ScrollArea, Stack} from "@mantine/core";
import {CommentCard} from "@/components/comments/cards";

export function CommentGrid(
  { comments }: { comments: CulledComment[] }
) {

  return (
    <ScrollArea bd={"1px solid gray.3"} p={"lg"} bdrs={"md"} h={700}>
      <Stack>
        {comments.map((item, index) =>
          <CommentCard key={item.id} comment={item}/>
        )}
      </Stack>
    </ScrollArea>
  );
}