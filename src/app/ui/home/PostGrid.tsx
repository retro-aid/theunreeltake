"use client";

import { Grid } from "@mantine/core";
import { CatalogItem } from "@/app/api/catalog/route";
import { MoviePostCard } from "@/app/ui/home/MoviePostCard";

/**
 * This function helps display the posts users can see when visiting the Catalog Page.
 * mapToPostcard displays the amount of rows of posts depending on the screen size.
 * The base is 12 meaning 12 posts per page, if the screen for example is small (sm) then it would 6 rows of 2 posts.
 *
 * @remarks this function is called in the Catalog Page. Path: src/app/(home)/catalog/page.tsx
 *
 * @param gets all published posts
 * The breakpoints are the pixel sizes on the screen for users on the site.
 * @returns The Posts layout depending on the screen size
 */
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
