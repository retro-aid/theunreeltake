import { Button } from "@mantine/core";
import { FileRichtext } from "react-bootstrap-icons";
import Link from "next/link";

export function PostsButton() {
  return (
    <Button
      component={Link}
      href={"/dashboard/posts/edit"}
      leftSection={<FileRichtext size={18} />}
      justify={"start"}
      color={"dark"}
      variant={"subtle"}
      fullWidth
      prefetch={false}
    >
      <span>Posts</span>
    </Button>
  );
}
