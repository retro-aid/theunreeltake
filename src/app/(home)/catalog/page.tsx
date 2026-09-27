'use client';

import { Flex, Group, Loader, Pagination } from "@mantine/core";
import { SearchBar } from "@/components/generic/SearchBar";
import PostGrid from "@/app/ui/home/PostGrid";
import CatalogActionButtons from "@/app/ui/home/CatalogActionButtons";
import {Suspense, useCallback, useEffect, useState, useTransition} from "react";
import { useSearchParams } from "next/navigation";
import { CatalogItem } from "@/app/api/catalog/route";
import RefreshDataButton from "@/app/ui/home/RefreshDataButton";
import { PostPageData } from "@/app/api/catalog/route";
import { allowedPostsPerPage } from "@/lib/constants";

// The main page content needs to be wrapped so useSearchParams doesn't block hydration/static gen
function MoviesPageContent() {
  const searchParams = useSearchParams();

  const [posts, setPosts] = useState<CatalogItem[]>([]);
  const [postsPerPage, setPostsPage] = useState(allowedPostsPerPage[0]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  
  // Initialize states with values from URL if they exist
  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [tags, setTags] = useState<string[]>(searchParams.getAll("tags"));
  const [sortBy, setSortBy] = useState("");

  const [isLoading, startTransition] = useTransition();

  const handleSearch = (value: string) => setSearch(value);
  const handleSortBy = (value: string) => setSortBy(value);
  const handleFilter = (value: string[]) => setTags(value);
  const handlePostsCount = (value: number) => setPostsPage(value);

  const refresh = useCallback(() => {
    startTransition(async () => {
      const urlSearchParams = new URLSearchParams();

      urlSearchParams.set("search", search);
      urlSearchParams.set("sort", sortBy);
      urlSearchParams.set("ppp", postsPerPage.toString());
      urlSearchParams.set("page", page.toString());
      
      // Append each tag to the search query
      tags.forEach(tag => urlSearchParams.append("tags", tag));

      const postPageData = await fetch(`/api/catalog?${urlSearchParams.toString()}`, { 
        method: "GET", 
        cache: "default" 
      }).then(async (res) => await res.json() as PostPageData);

      setPosts(postPageData.pageItems);
      setTotalCount(postPageData.totalCount);
    });
  }, [search, sortBy, page, postsPerPage, tags]);

  useEffect(() => {

    refresh();
  }, [refresh]);

  return (
      <Flex direction={"column"} p={{ base: "sm", sm: "lg" }}>
        <Group gap={"xs"}>
          <Flex w={{ base: "100%", sm: "80%", md: "40%" }}>
            <SearchBar
              initialValue={search}
              onSearchAction={(value) => {
                handleSearch(value);
                setPage(1);
              }}
            />
          </Flex>
          <Group gap={"xs"} ml={{ base: "lg", md: 0 }}>
            <CatalogActionButtons 
            onSortByAction={handleSortBy} 
            onFilterAction={handleFilter} 
            onPostsCountAction={handlePostsCount} />
            <RefreshDataButton updateData={refresh} />
          </Group>
        </Group>

        {isLoading ? (
          <CatalogLoader />
        ) : (
          <>
            <PostGrid posts={posts} />
            {totalCount > 0 && (
              <Pagination
                color={"dark"}
                total={Math.ceil(totalCount / postsPerPage)}
                value={page}
                onChange={setPage}
                mb={"md"}
              />
            )}
          </>
        )}
      </Flex>
  );
}

export default function MoviesPage() {
  return (
    <Suspense>
      <MoviesPageContent />
    </Suspense>
  );
}

function CatalogLoader() {
  return (
    <Flex h={"50vh"} align={"center"} justify={"center"}>
      <div>
        <Loader color={"dark"} type={"oval"} />
      </div>
    </Flex>
  );
}