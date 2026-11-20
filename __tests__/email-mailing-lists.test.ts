import { beforeEach, describe, expect, it, vi } from "vitest";
import { requireAdmin } from "@/lib/dal/utils";
import * as email from "@/lib/dal/dto/email";

vi.mock(import("server-only"), () => {
  return {};
});
vi.mock(import("@/lib/dal/utils"), async (importOriginal) => ({
  ...(await importOriginal()),
  requireAdmin: vi.fn(),
}));

const { segments, contacts } = vi.hoisted(() => ({
  segments: {
    list: vi.fn(),
    create: vi.fn(),
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

/** The first page of results with the default page size. */
const firstPage = { paginateOption: "none" } as const;

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
const contact = {
  id: "contact-1",
  email: "fan@example.com",
  first_name: "Sam",
  last_name: null,
  unsubscribed: false,
  created_at: "2026-11-05",
};
const member = { contactId: "contact-1", segmentId: "movie-id" };

beforeEach(() => {
  vi.resetAllMocks();
  segments.list.mockResolvedValue(page([newsList, movieList]));
  contacts.list.mockResolvedValue(page([contact]));
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
    ["list", () => email.mailingLists.list(firstPage)],
    ["create", () => email.mailingLists.create({ name: "New" })],
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
    [
      "listSubscribers",
      () =>
        email.mailingLists.listSubscribers({
          segmentId: "movie-id",
          ...firstPage,
        }),
    ],
    ["addSubscriber", () => email.mailingLists.addSubscriber(member)],
    ["removeSubscriber", () => email.mailingLists.removeSubscriber(member)],
  ] as const)(
    "%s rejects non-admins without calling Resend",
    async (_name, call) => {
      vi.mocked(requireAdmin).mockRejectedValueOnce(new Error("Forbidden"));

      await expect(call()).rejects.toThrow("Forbidden");
      expect(contacts.list).not.toHaveBeenCalled();
      expect(contacts.segments.add).not.toHaveBeenCalled();
      expect(contacts.segments.remove).not.toHaveBeenCalled();
    },
  );
});

/**
 * Tests for listing mailing lists
 *
 * Checks:
 *    Returns one page of lists and whether there are more
 *    Returns an empty page when there are none
 *    Asks Resend for the page after the given list
 *    Rejects invalid pagination without calling Resend
 *    Rejects with Resend's error message
 */
describe("list", () => {
  it("returns one page of lists and whether there are more", async () => {
    expect(await email.mailingLists.list(firstPage)).toStrictEqual({
      has_more: false,
      data: [newsList, movieList],
    });
    expect(segments.list).toHaveBeenCalledWith({ limit: 25 });
  });

  it("returns an empty page when there are none", async () => {
    segments.list.mockResolvedValueOnce(page([]));

    expect(await email.mailingLists.list(firstPage)).toStrictEqual({
      has_more: false,
      data: [],
    });
  });

  it("asks Resend for the page after the given list", async () => {
    segments.list.mockResolvedValueOnce(page([movieList]));

    await email.mailingLists.list({
      paginateOption: "after",
      after: "news-id",
      limit: 10,
    });

    expect(segments.list).toHaveBeenCalledWith({
      limit: 10,
      after: "news-id",
    });
  });

  it("rejects invalid pagination without calling Resend", async () => {
    await expect(
      email.mailingLists.list({ paginateOption: "none", limit: 0 }),
    ).rejects.toThrow();
    expect(segments.list).not.toHaveBeenCalled();
  });

  it("rejects with Resend's error message", async () => {
    segments.list.mockResolvedValueOnce(fail("Invalid API key", 401));

    await expect(email.mailingLists.list(firstPage)).rejects.toMatchObject({
      message: "Invalid API key",
      status: 401,
    });
  });
});

/**
 * Tests for listing everyone on a mailing list
 *
 * Checks:
 *    Returns one page of the list's subscribers
 *    Rejects a missing list ID without calling Resend
 *    Rejects with Resend's message and status when the list doesn't exist
 */
describe("listSubscribers", () => {
  it("returns one page of the list's subscribers", async () => {
    const result = await email.mailingLists.listSubscribers({
      segmentId: "movie-id",
      ...firstPage,
    });

    expect(result).toStrictEqual({ has_more: false, data: [contact] });
    expect(contacts.list).toHaveBeenCalledWith({
      segmentId: "movie-id",
      limit: 25,
    });
  });

  it("rejects a missing list ID without calling Resend", async () => {
    await expect(
      email.mailingLists.listSubscribers(firstPage as never),
    ).rejects.toThrow();
    expect(contacts.list).not.toHaveBeenCalled();
  });

  it("rejects with Resend's message and status when the list doesn't exist", async () => {
    contacts.list.mockResolvedValueOnce(fail("Segment not found", 404));

    await expect(
      email.mailingLists.listSubscribers({ segmentId: "missing", ...firstPage }),
    ).rejects.toMatchObject({ message: "Segment not found", status: 404 });
  });
});

/**
 * Tests for creating a mailing list
 *
 * Checks:
 *    Creates the list and returns its ID and name
 *    Rejects a blank name without calling Resend
 *    Rejects with Resend's message and status when the create fails
 */
describe("create", () => {
  it("creates the list and returns its ID and name", async () => {
    segments.create.mockResolvedValueOnce(
      ok({ object: "segment", id: "new-id", name: "Behind the Scenes" }),
    );

    const result = await email.mailingLists.create({
      name: "Behind the Scenes",
    });

    expect(result).toStrictEqual({ id: "new-id", name: "Behind the Scenes" });
    expect(segments.create).toHaveBeenCalledWith({
      name: "Behind the Scenes",
    });
  });

  it("rejects a blank name without calling Resend", async () => {
    await expect(email.mailingLists.create({ name: "" })).rejects.toThrow();
    expect(segments.create).not.toHaveBeenCalled();
  });

  it("rejects with Resend's message and status when the create fails", async () => {
    segments.create.mockResolvedValueOnce(fail("Rate limit exceeded", 429));

    await expect(
      email.mailingLists.create({ name: "New" }),
    ).rejects.toMatchObject({ message: "Rate limit exceeded", status: 429 });
  });
});

/**
 * Tests for deleting a mailing list
 *
 * Checks:
 *    Deletes the list and returns its ID
 *    Rejects with Resend's message and status when it doesn't exist
 */
describe("remove", () => {
  it("deletes the list and returns its ID", async () => {
    segments.remove.mockResolvedValueOnce(
      ok({ object: "segment", id: "movie-id", deleted: true }),
    );

    const result = await email.mailingLists.remove("movie-id");

    expect(result).toStrictEqual({ id: "movie-id", deleted: true });
    expect(segments.remove).toHaveBeenCalledWith("movie-id");
  });

  it("rejects with Resend's message and status when it doesn't exist", async () => {
    segments.remove.mockResolvedValueOnce(fail("Segment not found", 404));

    await expect(
      email.mailingLists.remove("missing"),
    ).rejects.toMatchObject({ message: "Segment not found", status: 404 });
  });
});

/**
 * Tests for adding and removing subscribers
 *
 * Checks:
 *    Adds a subscriber to the list
 *    Removes a subscriber from the list
 *    Rejects a blank subscriber ID without calling Resend
 *    Rejects with Resend's message when the subscriber doesn't exist
 */
describe("subscribers", () => {
  it("adds a subscriber to the list", async () => {
    contacts.segments.add.mockResolvedValueOnce(ok({ id: "contact-1" }));

    const result = await email.mailingLists.addSubscriber(member);

    expect(result).toStrictEqual({ id: "contact-1" });
    expect(contacts.segments.add).toHaveBeenCalledWith(member);
  });

  it("removes a subscriber from the list", async () => {
    contacts.segments.remove.mockResolvedValueOnce(
      ok({ id: "contact-1", deleted: true }),
    );

    const result = await email.mailingLists.removeSubscriber(member);

    expect(result).toStrictEqual({ id: "contact-1", deleted: true });
    expect(contacts.segments.remove).toHaveBeenCalledWith(member);
  });

  it("rejects a blank subscriber ID without calling Resend", async () => {
    await expect(
      email.mailingLists.addSubscriber({ ...member, contactId: "" }),
    ).rejects.toThrow();
    expect(contacts.segments.add).not.toHaveBeenCalled();
  });

  it("rejects with Resend's message when the subscriber doesn't exist", async () => {
    contacts.segments.add.mockResolvedValueOnce(fail("Contact not found", 404));

    await expect(
      email.mailingLists.addSubscriber(member),
    ).rejects.toMatchObject({ message: "Contact not found", status: 404 });
  });
});
