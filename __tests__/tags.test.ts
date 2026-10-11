import { beforeEach, describe, expect, it, vi } from "vitest";
import prisma from "@/lib/__mocks__/prisma";
import {
  createTag,
  deleteTag,
  getAdminTags,
  getAllTags,
  updateTag,
} from "@/lib/dal/dto/tags";
import { AllowedTagType } from "@/lib/constants";
import { Tag } from "@/generated/prisma/client";
import type { CreateTagForm } from "@/lib/schemas/tag-schemas";

vi.mock(import("server-only"), () => {
  return {};
});

vi.mock(import("@/lib/prisma"));

beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation(() => {});
});

const mediaTag = { id: 1, displayName: "Horror", type: AllowedTagType.Media };

/**
 * Tests for updating a tag
 *
 * Checks:
 *    Updates the tag by ID and returns it
 *    Rejects when the tag doesn't exist
 *    Rejects an invalid tag type without touching the database
 *    Rejects a display name that's too short without touching the database
 *    Rejects an invalid ID without touching the database
 */
describe("updateTag", () => {
  it("updates the tag by ID and returns it", async () => {
    const updated = { ...mediaTag, displayName: "Thriller" } as Tag;
    prisma.tag.update.mockResolvedValueOnce(updated);

    const result = await updateTag(1, "Thriller", AllowedTagType.Media);

    expect(result).toBe(updated);
    expect(prisma.tag.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { displayName: "Thriller", type: AllowedTagType.Media },
    });
  });

  it("rejects when the tag does not exist", async () => {
    prisma.tag.update.mockRejectedValueOnce(
      new Error("Record to update not found."),
    );

    await expect(
      updateTag(999, "Thriller", AllowedTagType.Media),
    ).rejects.toThrow("Record to update not found.");
  });

  it("rejects an invalid tag type without updating anything", async () => {
    await expect(updateTag(1, "Thriller", "not-a-real-type")).rejects.toThrow();
    expect(prisma.tag.update).not.toHaveBeenCalled();
  });

  it("rejects a display name under 3 characters without updating anything", async () => {
    await expect(updateTag(1, "ab", AllowedTagType.Media)).rejects.toThrow();
    expect(prisma.tag.update).not.toHaveBeenCalled();
  });

  it("rejects a non-integer or negative ID without updating anything", async () => {
    await expect(
      updateTag(1.5, "Thriller", AllowedTagType.Media),
    ).rejects.toThrow();
    await expect(
      updateTag(-1, "Thriller", AllowedTagType.Media),
    ).rejects.toThrow();
    expect(prisma.tag.update).not.toHaveBeenCalled();
  });
});

/**
 * Tests for fetching the public (media) tags
 *
 * Checks:
 *    Only queries media tags and leaves out the type field
 *    Returns the tags from the database
 *    Returns an empty array when there are no media tags
 *    Rejects when the database query fails
 */
describe("getAllTags", () => {
  it("only queries media tags and leaves out the type field", async () => {
    prisma.tag.findMany.mockResolvedValueOnce([]);

    await getAllTags();

    expect(prisma.tag.findMany).toHaveBeenCalledWith({
      where: { type: AllowedTagType.Media },
      omit: { type: true },
    });
  });

  it("returns the tags from the database", async () => {
    const tags = [
      { id: 1, displayName: "Horror" },
      { id: 2, displayName: "Comedy" },
    ];
    prisma.tag.findMany.mockResolvedValueOnce(tags as never);

    const result = await getAllTags();

    expect(result).toBe(tags);
  });

  it("returns an empty array when there are no media tags", async () => {
    prisma.tag.findMany.mockResolvedValueOnce([]);

    const result = await getAllTags();

    expect(result).toStrictEqual([]);
  });

  it("rejects when the database query fails", async () => {
    prisma.tag.findMany.mockRejectedValueOnce(new Error("Database error"));

    await expect(getAllTags()).rejects.toThrow("Database error");
  });
});

/**
 * Tests for fetching every tag for the admin table
 *
 * Checks:
 *    Queries every tag with no filters
 *    Returns tags of every type
 *    Returns an empty array when there are no tags
 *    Rejects when the database query fails
 */
describe("getAdminTags", () => {
  it("queries every tag with no filters", async () => {
    prisma.tag.findMany.mockResolvedValueOnce([]);

    await getAdminTags();

    expect(prisma.tag.findMany).toHaveBeenCalledWith();
  });

  it("returns tags of every type", async () => {
    const tags = [mediaTag, { id: 2, displayName: "Spoilers", type: "other" }];
    prisma.tag.findMany.mockResolvedValueOnce(tags as Tag[]);

    const result = await getAdminTags();

    expect(result).toBe(tags);
    expect(result).toHaveLength(2);
  });

  it("returns an empty array when there are no tags", async () => {
    prisma.tag.findMany.mockResolvedValueOnce([]);

    const result = await getAdminTags();

    expect(result).toStrictEqual([]);
  });

  it("rejects when the database query fails", async () => {
    prisma.tag.findMany.mockRejectedValueOnce(new Error("Database error"));

    await expect(getAdminTags()).rejects.toThrow("Database error");
  });
});

/**
 * Tests for creating a tag
 *
 * Checks:
 *    Creates the tag, mapping name to displayName, and returns it
 *    Accepts names right at the 3 and 128 character limits
 *    Rejects names outside the length limits without creating anything
 *    Rejects an invalid tag type without creating anything
 *    Rejects when the database write fails
 */
describe("createTag", () => {
  const form: CreateTagForm = { name: "Horror", type: AllowedTagType.Media };

  it("creates the tag and returns it", async () => {
    prisma.tag.create.mockResolvedValueOnce(mediaTag as Tag);

    const result = await createTag(form);

    expect(result).toBe(mediaTag);
    expect(prisma.tag.create).toHaveBeenCalledWith({
      data: { displayName: "Horror", type: AllowedTagType.Media },
    });
  });

  it.each([3, 128])(
    "accepts a name that is exactly %i characters",
    async (len) => {
      prisma.tag.create.mockResolvedValueOnce(mediaTag as Tag);

      await createTag({ ...form, name: "a".repeat(len) });

      expect(prisma.tag.create).toHaveBeenCalledOnce();
    },
  );

  it.each([2, 129])("rejects a name that is %i characters", async (len) => {
    await expect(
      createTag({ ...form, name: "a".repeat(len) }),
    ).rejects.toThrow();
    expect(prisma.tag.create).not.toHaveBeenCalled();
  });

  it("rejects an invalid tag type without creating anything", async () => {
    await expect(
      createTag({ ...form, type: "not-a-real-type" } as never),
    ).rejects.toThrow();
    expect(prisma.tag.create).not.toHaveBeenCalled();
  });

  it("rejects when the database write fails", async () => {
    prisma.tag.create.mockRejectedValueOnce(new Error("Database error"));

    await expect(createTag(form)).rejects.toThrow("Database error");
  });
});

/**
 * Tests for deleting a tag
 *
 * Checks:
 *    Deletes the tag by ID and returns it
 *    Rejects when the tag doesn't exist
 *    Rejects an invalid ID without deleting anything
 *    Rejects when the database delete fails
 */
describe("deleteTag", () => {
  it("deletes the tag by ID and returns it", async () => {
    prisma.tag.delete.mockResolvedValueOnce(mediaTag as Tag);

    const result = await deleteTag(1);

    expect(result).toBe(mediaTag);
    expect(prisma.tag.delete).toHaveBeenCalledWith({ where: { id: 1 } });
  });

  it("rejects when the tag does not exist", async () => {
    prisma.tag.delete.mockRejectedValueOnce(
      new Error("Record to delete does not exist."),
    );

    await expect(deleteTag(999)).rejects.toThrow(
      "Record to delete does not exist.",
    );
  });

  it.each([0, -1, 1.5, NaN])(
    "rejects an invalid ID (%s) without deleting anything",
    async (id) => {
      await expect(deleteTag(id)).rejects.toThrow();
      expect(prisma.tag.delete).not.toHaveBeenCalled();
    },
  );

  it("rejects when the database delete fails", async () => {
    prisma.tag.delete.mockRejectedValueOnce(new Error("Database error"));

    await expect(deleteTag(1)).rejects.toThrow("Database error");
  });
});
