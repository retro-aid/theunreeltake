import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  add,
  create,
  list,
  remove,
} from "@/lib/dal/dto/email/subscribers";

const { contacts, requireAdmin } = vi.hoisted(() => ({
  contacts: {
    create: vi.fn(),
    list: vi.fn(),
    remove: vi.fn(),
  },
  requireAdmin: vi.fn(),
}));

vi.mock(import("server-only"), () => ({}));
vi.mock("@/lib/dal/utils", () => ({ requireAdmin }));
vi.mock("@/lib/dal/dto/email/resend", () => ({
  resend: { contacts },
}));

beforeEach(() => {
  vi.clearAllMocks();
  process.env.RESEND_AUDIENCE_ID = "audience-1";
  requireAdmin.mockResolvedValue({ user: { role: "admin" } });
});

/**
 * Tests for listing subscribers from the Resend audience.
 *
 * Checks:
 *    Loads every page and passes the pagination cursor to Resend
 *    Requires an administrator before calling Resend
 *    Returns Resend API failures without discarding their details
 */
describe("list subscribers", () => {
  it("loads every page of subscribers", async () => {
    contacts.list
      .mockResolvedValueOnce({
        data: { data: [{ id: "contact-1" }], has_more: true },
        error: null,
        headers: null,
      })
      .mockResolvedValueOnce({
        data: { data: [{ id: "contact-2" }], has_more: false },
        error: null,
        headers: null,
      });

    await expect(list()).resolves.toEqual({
      data: {
        object: "list",
        data: [{ id: "contact-1" }, { id: "contact-2" }],
        has_more: false,
      },
      error: null,
      headers: null,
    });
    expect(contacts.list).toHaveBeenNthCalledWith(1, {
      audienceId: "audience-1",
      limit: 100,
      after: undefined,
    });
    expect(contacts.list).toHaveBeenNthCalledWith(2, {
      audienceId: "audience-1",
      limit: 100,
      after: "contact-1",
    });
  });

  it("requires an administrator before listing contacts", async () => {
    requireAdmin.mockRejectedValueOnce(new Error("Forbidden"));

    await expect(list()).rejects.toThrow("Forbidden");
    expect(contacts.list).not.toHaveBeenCalled();
  });

  it("throws when Resend returns a list error", async () => {
    contacts.list.mockResolvedValueOnce({
      data: null,
      error: { message: "Resend unavailable" },
    });

    await expect(list()).resolves.toMatchObject({
      data: null,
      error: { message: "Resend unavailable" },
    });
  });
});

/**
 * Tests for adding a subscriber from the administrator dashboard.
 *
 * Checks:
 *    Validates subscriber fields before calling Resend
 *    Passes the audience ID, email, and optional names to Resend
 *    Returns duplicate-contact errors from Resend
 */
describe("add subscriber", () => {
  it("creates a valid contact in the configured audience", async () => {
    contacts.create.mockResolvedValueOnce({
      data: { id: "contact-1" },
      error: null,
      headers: null,
    });

    await expect(
      add({ email: "reader@example.com", firstName: "Reader" }),
    ).resolves.toEqual({ data: { id: "contact-1" }, error: null, headers: null });
    expect(requireAdmin).toHaveBeenCalledOnce();
    expect(contacts.create).toHaveBeenCalledWith({
      audienceId: "audience-1",
      email: "reader@example.com",
      firstName: "Reader",
      lastName: undefined,
    });
  });

  it("rejects an invalid email without calling Resend", async () => {
    await expect(add({ email: "invalid" })).rejects.toThrow();
    expect(contacts.create).not.toHaveBeenCalled();
  });

  it("throws Resend duplicate-contact errors", async () => {
    contacts.create.mockResolvedValueOnce({
      data: null,
      error: { message: "Contact already exists" },
    });

    await expect(add({ email: "reader@example.com" })).resolves.toMatchObject({
      data: null,
      error: { message: "Contact already exists" },
    });
  });
});

/**
 * Tests for public subscriber sign-up.
 *
 * Checks:
 *    Creates a subscriber without requiring an admin session
 *    Rejects invalid details before calling Resend
 *    Returns Resend API failures without discarding their details
 */
describe("create subscriber", () => {
  it("creates a contact without requiring an administrator", async () => {
    contacts.create.mockResolvedValueOnce({
      data: { id: "contact-1" },
      error: null,
      headers: null,
    });

    await expect(create({ email: "reader@example.com" })).resolves.toEqual({
      data: { id: "contact-1" },
      error: null,
      headers: null,
    });
    expect(requireAdmin).not.toHaveBeenCalled();
  });

  it("rejects invalid input without calling Resend", async () => {
    await expect(create({ email: "invalid" })).rejects.toThrow();
    expect(contacts.create).not.toHaveBeenCalled();
  });

  it("throws Resend sign-up failures", async () => {
    contacts.create.mockResolvedValueOnce({
      data: null,
      error: { message: "Contact already exists" },
    });

    await expect(
      create({ email: "reader@example.com" }),
    ).resolves.toMatchObject({
      data: null,
      error: { message: "Contact already exists" },
    });
  });
});

/**
 * Tests for deleting a subscriber from the Resend audience.
 *
 * Checks:
 *    Passes the contact and audience IDs to Resend
 *    Requires an administrator before deletion
 *    Rejects an empty contact ID without calling Resend
 *    Returns API failures instead of reporting a successful deletion
 */
describe("remove subscriber", () => {
  it("deletes the selected contact from the configured audience", async () => {
    contacts.remove.mockResolvedValueOnce({
      data: { object: "contact", deleted: true, contact: "contact-1" },
      error: null,
      headers: null,
    });

    await expect(remove("contact-1")).resolves.toEqual({
      data: { object: "contact", deleted: true, contact: "contact-1" },
      error: null,
      headers: null,
    });
    expect(contacts.remove).toHaveBeenCalledWith({
      id: "contact-1",
      audienceId: "audience-1",
    });
  });

  it("rejects an empty ID without calling Resend", async () => {
    await expect(remove(" ")).rejects.toThrow("Subscriber ID is required");
    expect(contacts.remove).not.toHaveBeenCalled();
  });

  it("throws deletion API errors", async () => {
    contacts.remove.mockResolvedValueOnce({
      data: null,
      error: { message: "Resend unavailable" },
    });

    await expect(remove("contact-1")).resolves.toMatchObject({
      data: null,
      error: { message: "Resend unavailable" },
    });
  });
});
