import { beforeEach, describe, expect, it, vi } from "vitest";
import { requireAdmin } from "@/lib/dal/utils";
import * as email from "@/lib/dal/dto/email";

vi.mock(import("server-only"), () => {
  return {};
});
vi.mock(import("@/lib/dal/utils"), () => ({ requireAdmin: vi.fn() }));

const { segments, contacts } = vi.hoisted(() => ({
  segments: {
    list: vi.fn(),
    get: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  },
  contacts: {
    list: vi.fn(),
    segments: { add: vi.fn(), remove: vi.fn() },
  },
}));
vi.mock("resend", () => ({
  Resend: class {
    segments = segments;
    contacts = contacts;
  },
}));

/** Builds a successful Resend response. */
const ok = (data: unknown) => ({ data, error: null });

/** Builds a failed Resend response. */
const fail = (message: string, statusCode = 500) => ({
  data: null,
  error: { message, statusCode },
});

/** Builds a page of results the way Resend's list endpoints return them. */
const page = (data: unknown[], hasMore = false) =>
  ok({ object: "list", data, has_more: hasMore });

const newsList = {
  id: "news-id",
  name: "Newsletter",
  created_at: "2026-11-05",
};
const movieList = {
  id: "movie-id",
  name: "Movie Reviews",
  created_at: "2026-11-05",
};
const member = { mailingListId: "movie-id", email: "fan@example.com" };

beforeEach(() => {
  vi.resetAllMocks();
  segments.list.mockResolvedValue(page([newsList, movieList]));
});

/**
 * Tests that every function blocks non-admins
 *
 * Checks:
 *    Rejects with the auth error
 *    Never calls Resend
 */
describe("admin access", () => {
  it.each([
    ["list", () => email.mailingLists.list()],
    ["get", () => email.mailingLists.get("movie-id")],
    ["create", () => email.mailingLists.create({ name: "New" })],
    ["update", () => email.mailingLists.update("movie-id", { name: "New" })],
    ["remove", () => email.mailingLists.remove("movie-id")],
  ] as const)(
    "%s rejects non-admins without calling Resend",
    async (method, call) => {
      vi.mocked(requireAdmin).mockRejectedValueOnce(new Error("Forbidden"));

      await expect(call()).rejects.toThrow("Forbidden");
      expect(segments[method]).not.toHaveBeenCalled();
    },
  );

  it.each([
    ["addSubscriber", () => email.mailingLists.addSubscriber(member)],
    ["removeSubscriber", () => email.mailingLists.removeSubscriber(member)],
  ] as const)(
    "%s rejects non-admins without calling Resend",
    async (_name, call) => {
      vi.mocked(requireAdmin).mockRejectedValueOnce(new Error("Forbidden"));

      await expect(call()).rejects.toThrow("Forbidden");
      expect(contacts.segments.add).not.toHaveBeenCalled();
      expect(contacts.segments.remove).not.toHaveBeenCalled();
    },
  );
});

/**
 * Tests for listing mailing lists
 *
 * Checks:
 *    Returns just each list's ID and name
 *    Returns an empty list when there are none
 *    Goes through every page
 */
describe("list", () => {
  it("returns just each list's ID and name", async () => {
    expect(await email.mailingLists.list()).toStrictEqual([
      { id: "news-id", name: "Newsletter" },
      { id: "movie-id", name: "Movie Reviews" },
    ]);
  });

  it("returns an empty list when there are none", async () => {
    segments.list.mockResolvedValueOnce(page([]));

    expect(await email.mailingLists.list()).toStrictEqual([]);
    expect(segments.create).not.toHaveBeenCalled();
  });

  it("goes through every page", async () => {
    segments.list
      .mockResolvedValueOnce(page([newsList], true))
      .mockResolvedValueOnce(page([movieList]));

    const result = await email.mailingLists.list();

    expect(segments.list).toHaveBeenNthCalledWith(2, {
      limit: 100,
      after: "news-id",
    });
    expect(result).toHaveLength(2);
  });
});

/**
 * Tests for loading one mailing list
 *
 * Checks:
 *    Returns the list and everyone on it, with camelCase names
 *    Rejects a blank ID without calling Resend
 *    Rejects with Resend's message and status when it doesn't exist
 */
describe("get", () => {
  it("returns the list and everyone on it, with camelCase names", async () => {
    segments.get.mockResolvedValueOnce(ok({ object: "segment", ...movieList }));
    contacts.list.mockResolvedValueOnce(
      page([
        {
          id: "contact-1",
          email: "fan@example.com",
          first_name: "Sam",
          last_name: null,
          unsubscribed: false,
          created_at: "2026-11-05",
        },
      ]),
    );

    expect(await email.mailingLists.get("movie-id")).toStrictEqual({
      id: "movie-id",
      name: "Movie Reviews",
      subscribers: [
        {
          id: "contact-1",
          email: "fan@example.com",
          firstName: "Sam",
          lastName: null,
          unsubscribed: false,
        },
      ],
    });
    expect(contacts.list).toHaveBeenCalledWith({
      segmentId: "movie-id",
      limit: 100,
      after: undefined,
    });
  });

  it("rejects a blank ID without calling Resend", async () => {
    await expect(email.mailingLists.get(" ")).rejects.toThrow(
      "Mailing list ID is required",
    );
    expect(segments.get).not.toHaveBeenCalled();
  });

  it("rejects with Resend's message and status when it doesn't exist", async () => {
    segments.get.mockResolvedValueOnce(fail("Segment not found", 404));

    await expect(email.mailingLists.get("missing")).rejects.toMatchObject({
      message: "Segment not found",
      status: 404,
    });
  });
});

/**
 * Tests for creating a mailing list
 *
 * Checks:
 *    Creates the list and returns just its ID
 *    Rejects a name another list already uses, ignoring case
 *    Rejects a blank name without calling Resend
 */
describe("create", () => {
  it("creates the list and returns just its ID", async () => {
    segments.create.mockResolvedValueOnce(
      ok({ object: "segment", id: "new-id", name: "Behind the Scenes" }),
    );

    const result = await email.mailingLists.create({
      name: " Behind the Scenes ",
    });

    expect(result).toStrictEqual({ id: "new-id" });
    expect(segments.create).toHaveBeenCalledWith({
      name: "Behind the Scenes",
    });
  });

  it("rejects a name another list already uses, ignoring case", async () => {
    await expect(
      email.mailingLists.create({ name: "movie reviews" }),
    ).rejects.toMatchObject({
      message: "A mailing list with that name already exists",
      status: 409,
    });
    expect(segments.create).not.toHaveBeenCalled();
  });

  it("rejects a blank name without calling Resend", async () => {
    await expect(email.mailingLists.create({ name: " " })).rejects.toThrow(
      "Name is required",
    );
    expect(segments.list).not.toHaveBeenCalled();
  });
});

/**
 * Tests for renaming a mailing list
 *
 * Checks:
 *    Renames the list and returns just its ID
 *    Lets a list keep its own name
 *    Rejects a name another list already uses
 */
describe("update", () => {
  it("renames the list and returns just its ID", async () => {
    segments.update.mockResolvedValueOnce(
      ok({ object: "segment", id: "movie-id" }),
    );

    const result = await email.mailingLists.update("movie-id", {
      name: "Film Reviews",
    });

    expect(result).toStrictEqual({ id: "movie-id" });
    expect(segments.update).toHaveBeenCalledWith("movie-id", {
      name: "Film Reviews",
    });
  });

  it("lets a list keep its own name", async () => {
    segments.update.mockResolvedValueOnce(
      ok({ object: "segment", id: "movie-id" }),
    );

    await email.mailingLists.update("movie-id", { name: "Movie Reviews" });

    expect(segments.update).toHaveBeenCalled();
  });

  it("rejects a name another list already uses", async () => {
    await expect(
      email.mailingLists.update("movie-id", { name: "newsletter" }),
    ).rejects.toMatchObject({ status: 409 });
    expect(segments.update).not.toHaveBeenCalled();
  });
});

/**
 * Tests for deleting a mailing list
 *
 * Checks:
 *    Deletes the list and returns just its ID
 *    Rejects a blank ID without calling Resend
 */
describe("remove", () => {
  it("deletes the list and returns just its ID", async () => {
    segments.remove.mockResolvedValueOnce(
      ok({ object: "segment", id: "movie-id", deleted: true }),
    );

    const result = await email.mailingLists.remove("movie-id");

    expect(result).toStrictEqual({ id: "movie-id" });
    expect(segments.remove).toHaveBeenCalledWith("movie-id");
  });

  it("rejects a blank ID without calling Resend", async () => {
    await expect(email.mailingLists.remove(" ")).rejects.toThrow(
      "Mailing list ID is required",
    );
    expect(segments.remove).not.toHaveBeenCalled();
  });
});

/**
 * Tests for adding and removing subscribers
 *
 * Checks:
 *    Adds a subscriber to the list by email
 *    Removes a subscriber from the list by email
 *    Rejects an invalid email without calling Resend
 *    Rejects with Resend's message when the subscriber doesn't exist
 */
describe("subscribers", () => {
  it("adds a subscriber to the list by email", async () => {
    contacts.segments.add.mockResolvedValueOnce(ok({ id: "contact-1" }));

    const result = await email.mailingLists.addSubscriber({
      ...member,
      email: " fan@example.com ",
    });

    expect(result).toStrictEqual({ id: "contact-1" });
    expect(contacts.segments.add).toHaveBeenCalledWith({
      email: "fan@example.com",
      segmentId: "movie-id",
    });
  });

  it("removes a subscriber from the list by email", async () => {
    contacts.segments.remove.mockResolvedValueOnce(
      ok({ id: "contact-1", audienceId: "movie-id", deleted: true }),
    );

    const result = await email.mailingLists.removeSubscriber(member);

    expect(result).toStrictEqual({ id: "contact-1" });
    expect(contacts.segments.remove).toHaveBeenCalledWith({
      email: "fan@example.com",
      segmentId: "movie-id",
    });
  });

  it("rejects an invalid email without calling Resend", async () => {
    await expect(
      email.mailingLists.addSubscriber({ ...member, email: "not-an-email" }),
    ).rejects.toThrow("Enter a valid email");
    expect(contacts.segments.add).not.toHaveBeenCalled();
  });

  it("rejects with Resend's message when the subscriber doesn't exist", async () => {
    contacts.segments.add.mockResolvedValueOnce(fail("Contact not found", 404));

    await expect(
      email.mailingLists.addSubscriber(member),
    ).rejects.toMatchObject({ message: "Contact not found", status: 404 });
  });
});
