"use client";

import { Grid } from "@mantine/core";
import { CatalogItem } from "@/app/api/catalog/route";
import { MoviePostCard } from "@/app/ui/home/MoviePostCard";

export default function PostGrid({ posts }: { posts: CatalogItem[] }) {
  function mapToPostcard(data: CatalogItem, index: number) {
    return (
      <Grid.Col key={index} span={{ base: 12, sm: 6, md: 4, lg: 3, xl: 2 }}>
        <MoviePostCard postData={data} />
      </Grid.Col>
    );
  }

  const renderedPosts = posts.map(mapToPostcard);

  return (
    <Grid
      p={{ base: "sm", md: "xl" }}
      breakpoints={{
        xs: "320px",
        sm: "425px",
        md: "650px",
        lg: "900px",
        xl: "1300px",
      }}
    >
      {renderedPosts}
    </Grid>
  );
}
