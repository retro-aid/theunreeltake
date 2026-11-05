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
vi.mock("resend", () => ({
  Resend: class {
    contacts = contacts;
  },
}));

/** Builds a successful Resend response. */
const ok = (data: unknown) => ({ data, error: null, headers: null });

/** Builds a failed Resend response. */
const fail = (message: string, statusCode = 500) => ({
  data: null,
  error: { message, statusCode },
  headers: null,
});

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
 *    Throws Resend API failures with their status
 */
describe("list subscribers", () => {
  it("loads every page of subscribers", async () => {
    contacts.list
      .mockResolvedValueOnce(
        ok({ data: [{ id: "contact-1" }], has_more: true }),
      )
      .mockResolvedValueOnce(
        ok({ data: [{ id: "contact-2" }], has_more: false }),
      );

    await expect(list()).resolves.toEqual([
      { id: "contact-1" },
      { id: "contact-2" },
    ]);
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
    contacts.list.mockResolvedValueOnce(fail("Resend unavailable", 503));

    await expect(list()).rejects.toMatchObject({
      message: "Resend unavailable",
      status: 503,
    });
  });
});

/**
 * Tests for adding a subscriber from the administrator dashboard.
 *
 * Checks:
 *    Validates subscriber fields before calling Resend
 *    Passes the audience ID, email, and optional names to Resend
 *    Throws duplicate-contact errors from Resend
 */
describe("add subscriber", () => {
  it("creates a valid contact in the configured audience", async () => {
    contacts.create.mockResolvedValueOnce(ok({ id: "contact-1" }));

    await expect(
      add({ email: "reader@example.com", firstName: "Reader" }),
    ).resolves.toEqual({ id: "contact-1" });
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
    contacts.create.mockResolvedValueOnce(fail("Contact already exists", 409));

    await expect(add({ email: "reader@example.com" })).rejects.toMatchObject({
      message: "Contact already exists",
      status: 409,
    });
  });
});

/**
 * Tests for public subscriber sign-up.
 *
 * Checks:
 *    Creates a subscriber without requiring an admin session
 *    Rejects invalid details before calling Resend
 *    Throws Resend API failures with their status
 */
describe("create subscriber", () => {
  it("creates a contact without requiring an administrator", async () => {
    contacts.create.mockResolvedValueOnce(ok({ id: "contact-1" }));

    await expect(create({ email: "reader@example.com" })).resolves.toEqual({
      id: "contact-1",
    });
    expect(requireAdmin).not.toHaveBeenCalled();
  });

  it("rejects invalid input without calling Resend", async () => {
    await expect(create({ email: "invalid" })).rejects.toThrow();
    expect(contacts.create).not.toHaveBeenCalled();
  });

  it("throws Resend sign-up failures", async () => {
    contacts.create.mockResolvedValueOnce(fail("Contact already exists", 409));

    await expect(
      create({ email: "reader@example.com" }),
    ).rejects.toMatchObject({
      message: "Contact already exists",
      status: 409,
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
 *    Throws API failures instead of reporting a successful deletion
 */
describe("remove subscriber", () => {
  it("deletes the selected contact from the configured audience", async () => {
    contacts.remove.mockResolvedValueOnce(
      ok({ object: "contact", deleted: true, contact: "contact-1" }),
    );

    await expect(remove("contact-1")).resolves.toEqual({
      object: "contact",
      deleted: true,
      contact: "contact-1",
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
    contacts.remove.mockResolvedValueOnce(fail("Resend unavailable", 503));

    await expect(remove("contact-1")).rejects.toMatchObject({
      message: "Resend unavailable",
      status: 503,
    });
  });
});
