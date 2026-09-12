"use client";

import {useEffect, useState, useTransition} from "react";
import { PostGrid } from "@/app/ui/admin/AdminPostGrid";
import { Title, Box, Loader, Center } from "@mantine/core";
import { PencilSquare, Chat, BarChart, Trash } from "react-bootstrap-icons";
import { getDraftPosts } from "@/lib/actions";
import { Post } from "@/generated/prisma/client";

const GRID_ICONS = {
  Edit: PencilSquare,
  Chat: Chat,
  Stats: BarChart,
  Delete: Trash,
};

export default function DraftsPage() {

  const [drafts, setDrafts] = useState<Post[]>([]);
  const [isLoading, startTransition] = useTransition();

  useEffect(() => {
    startTransition(async () => {

      const result = await getDraftPosts();

      if(result.success) {
        setDrafts(result.data);
      }

    });
  }, []);

  return (
    <Box>
      <Title order={2} mb="xl">Your Drafts</Title>
      
      {isLoading ? (
        <Center mt="xl">
          <Loader color="blue" />
        </Center>
      ) : drafts.length === 0 ? (
        <p>You have no saved drafts.</p>
      ) : (
        <PostGrid data={drafts} icons={GRID_ICONS} />
      )}
    </Box>
  );
}