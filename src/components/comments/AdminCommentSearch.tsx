"use client";

import { useMemo, useState } from "react";
import type { CulledAdminComment } from "@/lib/dal/dto/comments";
import { AdminCommentGrid } from "./AdminCommentGrid";
import { SearchBar } from "@/components/generic/SearchBar";

export function filterAdminComments(
    comments: CulledAdminComment[],
    search: string
) {
    const query = search.trim().toLowerCase();
    if (!query) return comments;

    return comments.filter(c =>
        [c.post.title, c.messageContent, c.username, c.email, c.userId]
            .some(field => field?.toLowerCase().includes(query))
    );
}

export function AdminCommentSearch(
    { comments }: { comments: CulledAdminComment[] }
) {
    const [search, setSearch] = useState("");
    const filtered = useMemo(
        () => filterAdminComments(comments, search),
        [comments, search]
    );

    return (
        <>
            <SearchBar initialValue={search}
                placeholderText={"Search by post, message, username, email or user ID"}
                onSearchAction={setSearch} />
            
            <AdminCommentGrid key={search} comments={filtered} />
        </>
    );
}