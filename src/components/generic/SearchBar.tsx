"use client";

import { Search, X } from "react-bootstrap-icons";
import { ActionIcon, TextInput } from "@mantine/core";
import React, { useState } from "react";
import { useDebouncedCallback } from "@mantine/hooks";

export function SearchBar(
    {
        initialValue,
        placeholderText,
        onSearchAction
    }: {
        initialValue?: string,
        placeholderText?: string,
        onSearchAction: (value: string) => void
    }
) {

    const [search, setSearch] = useState(initialValue ?? "");

    const handleSearch =
        useDebouncedCallback((value: string) => onSearchAction(value), 25);

    const handleKeyUp =
        (event: React.KeyboardEvent<HTMLInputElement>) => {
            if (event.key === "Enter") handleSearch(search);
        }

    const handleChange =
        (event: React.ChangeEvent<HTMLInputElement>) => setSearch(event.target.value);

    const handleClear = () => {
        setSearch("");
        handleSearch("");
    }

    return (
        <TextInput
            mx={"lg"}
            w={"100%"}
            value={search}
            onChange={handleChange}
            onKeyUp={handleKeyUp}
            radius={"xl"}
            size={"md"}
            placeholder={placeholderText ?? "Search"}
            rightSectionWidth={42}
            leftSection={<Search size={18} />}
            rightSection={search ?
                <ActionIcon
                    onClick={handleClear}
                    size={28}
                    radius={"xl"}
                    variant={"filled"}
                    color={"dark"}
                >
                    <X size={18} />
                </ActionIcon>
                : null
            }
            styles={{
                input: {
                    border: "calc(.0625rem * var(--mantine-scale)) solid var(--mantine-color-dark-1)"
                }
            }}
        />
    );
}