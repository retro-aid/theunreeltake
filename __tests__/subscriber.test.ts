import { beforeEach, describe, expect, it, vi } from "vitest";
import prisma from "@/lib/__mocks__/prisma";
import { getCurrentSession } from "@/lib/dal/utils";
import {
  createSubscriber,
  deleteSubscriber,
  getSubscriber,
  listSubscribers,
  updateSubscriber,
} from "@/lib/dal/dto/subscribers";

vi.mock(import("server-only"), () => ({}));
vi.mock(import("@/lib/prisma"));
vi.mock("@/lib/dal/utils", () => ({ getCurrentSession: vi.fn() }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
/**
 * Mock-up subscriber used to test subscriber database operations.
 */
const subscriber = {
  id: "subscriber-1",
  firstName: "Test",
  lastName: "Example",
  email: "Test@example.com",
  subDate: new Date("2026-10-01T00:00:00.000Z"),
};
/**
 * Mocks an authenticated admin session.
 */
function mockAdminSession() {
  vi.mocked(getCurrentSession).mockResolvedValue({
    user: { id: "admin-1", role: "admin" },
  } as never);
}

beforeEach(() => {
  vi.clearAllMocks();
  mockAdminSession();
  vi.spyOn(console, "error").mockImplementation(() => {});
});
/**
 * Tests the listSubscribers function.
 * Location Path: src/lib/dal/dto/subscribers.ts
 *
 * Test Cases:
 *  - Returns paginated subscribers and the total count
 *  - Applies bounded pagination defaults and the selected sort order
 *  - Rejects access from non-admin users
 *  - Returns a safe error when the database query fails
 */
describe("listSubscribers", () => {
  it("returns paginated subscribers and total for an administrator", async () => {
    prisma.subscriber.findMany.mockResolvedValue([subscriber] as never);
    prisma.subscriber.count.mockResolvedValue(1);

    const result = await listSubscribers({ page: 2, limit: 5, search: "sam" });

    expect(prisma.subscriber.findMany).toHaveBeenCalledWith({
      where: {
        OR: [
          { email: { contains: "sam", mode: "insensitive" } },
          { firstName: { contains: "sam", mode: "insensitive" } },
          { lastName: { contains: "sam", mode: "insensitive" } },
        ],
      },
      orderBy: { subDate: "desc" },
      skip: 5,
      take: 5,
    });
    expect(result).toEqual({ success: true, data: [subscriber], total: 1 });
  });

  it("uses bounded defaults and the selected sort", async () => {
    prisma.subscriber.findMany.mockResolvedValue([]);
    prisma.subscriber.count.mockResolvedValue(0);

    await listSubscribers({ page: -1, limit: 500, sort: "email-asc" });

    expect(prisma.subscriber.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: { email: "asc" },
        skip: 0,
        take: 100,
      }),
    );
  });

  it("blocks non-admin access", async () => {
    vi.mocked(getCurrentSession).mockResolvedValueOnce({
      user: { id: "user-1", role: "user" },
    } as never);

    const result = await listSubscribers();

    expect(result).toEqual({
      success: false,
      data: [],
      total: 0,
      error: "Unauthorized",
    });
    expect(prisma.subscriber.findMany).not.toHaveBeenCalled();
  });

  it("returns a safe error when the database query fails", async () => {
    prisma.subscriber.findMany.mockRejectedValue(new Error("DB unavailable"));

    const result = await listSubscribers();

    expect(result).toMatchObject({ success: false, data: [], total: 0 });
    expect(result.error).toBe("Failed to load subscribers.");
  });
});
/**
 * Tests the getSubscriber function.
 * Location Path: src/lib/dal/dto/subscribers.ts
 *
 * Test Cases:
 *  - Retrieves a subscriber by ID
 *  - Returns null and skips the database query for a blank ID
 */
describe("getSubscriber", () => {
  it("looks up one subscriber by id", async () => {
    prisma.subscriber.findUnique.mockResolvedValue(subscriber as never);

    await expect(getSubscriber("subscriber-1")).resolves.toEqual(subscriber);
    expect(prisma.subscriber.findUnique).toHaveBeenCalledWith({
      where: { id: "subscriber-1" },
    });
  });

  it("does not query for a blank id", async () => {
    await expect(getSubscriber(" ")).resolves.toBeNull();
    expect(prisma.subscriber.findUnique).not.toHaveBeenCalled();
  });
});
/**
 * Tests the createSubscriber function.
 * Location Path: src/lib/dal/dto/subscribers.ts
 *
 * Test Cases:
 *  - Validates input and creates a subscriber
 *  - Rejects an invalid email without calling prisma
 *  - Rejects an email already present in the subscriber list
 *  - Returns an error when prisma reports a constraint violation
 */
describe("createSubscriber", () => {
  it("validates and creates a subscriber", async () => {
    prisma.subscriber.create.mockResolvedValue(subscriber as never);

    const result = await createSubscriber({
      firstName: "Test",
      lastName: "Example",
      email: " test@example.com ",
    });

    expect(prisma.subscriber.create).toHaveBeenCalledWith({
      data: {
        firstName: "Test",
        lastName: "Example",
        email: "test@example.com",
      },
    });
    expect(result).toEqual({ success: true, data: subscriber });
  });

  it("rejects invalid email without calling Prisma", async () => {
    const result = await createSubscriber({ email: "not-an-email" });

    expect(result.success).toBe(false);
    expect(prisma.subscriber.create).not.toHaveBeenCalled();
  });

  it("rejects an email already present in the subscriber list", async () => {
    prisma.subscriber.findFirst.mockResolvedValue(
      { id: "existing-id" } as never,
    );

    const result = await createSubscriber({ email: "test@example.com" });

    expect(result).toEqual({
      success: false,
      error: "A subscriber with this email already exists.",
    });
    expect(prisma.subscriber.create).not.toHaveBeenCalled();
  });

  it("reports a duplicate email", async () => {
    prisma.subscriber.create.mockRejectedValue(
      Object.assign(new Error("Unique constraint"), { code: "P2002" }),
    );

    await expect(createSubscriber({ email: "test@example.com" })).resolves.toEqual(
      {
        success: false,
        error: "A subscriber with this email already exists.",
      },
    );
  });
});
/**
 * Tests the updateSubscriber function.
 * Location Path: src/lib/dal/dto/subscribers.ts
 *
 * Test Cases:
 *  - Updates supported subscriber fields
 *  - Rejects an update containing no fields
 *  - Rejects an email that is already assigned to another subscriber
 *  - Returns an error when the subscriber does not exist
 */
describe("updateSubscriber", () => {
  it("updates the provided supported fields", async () => {
    prisma.subscriber.update.mockResolvedValue({
      ...subscriber,
      firstName: "Testing",
    } as never);

    const result = await updateSubscriber("subscriber-1", {
      firstName: "Testing",
    });

    expect(prisma.subscriber.update).toHaveBeenCalledWith({
      where: { id: "subscriber-1" },
      data: { firstName: "Testing" },
    });
    expect(result).toMatchObject({
      success: true,
      data: { id: "subscriber-1", firstName: "Testing" },
    });
  });

  it("rejects an empty update", async () => {
    const result = await updateSubscriber("subscriber-1", {});

    expect(result.success).toBe(false);
    expect(prisma.subscriber.update).not.toHaveBeenCalled();
  });

  it("does not change the record when the requested email is already used", async () => {
    prisma.subscriber.findFirst.mockResolvedValue(
      { id: "other-sub" } as never,
    );

    const result = await updateSubscriber("subscriber-1", {
      email: "other@example.com",
    });

    expect(result).toEqual({
      success: false,
      error: "A subscriber with this email already exists.",
    });
    expect(prisma.subscriber.update).not.toHaveBeenCalled();
  });

  it("reports a missing subscriber without returning updated data", async () => {
    prisma.subscriber.update.mockRejectedValue(
      Object.assign(new Error("Record not found"), { code: "P2025" }),
    );

    await expect(
      updateSubscriber("missing", { firstName: "Sam" }),
    ).resolves.toEqual({ success: false, error: "Subscriber not found." });
  });
});
/**
 * Tests the deleteSubscriber function.
 * Location Path: src/lib/dal/dto/subscribers.ts
 *
 * Test Cases:
 *  - Successfully deletes a subscriber by id
 *  - Returns an error when the subscriber does not exist
 */
describe("deleteSubscriber", () => {
  it("deletes the subscriber by id", async () => {
    prisma.subscriber.delete.mockResolvedValue(subscriber as never);

    await expect(deleteSubscriber("subscriber-1")).resolves.toEqual({
      success: true,
    });
    expect(prisma.subscriber.delete).toHaveBeenCalledWith({
      where: { id: "subscriber-1" },
    });
  });

  it("keeps the operation unsuccessful when the subscriber is missing", async () => {
    prisma.subscriber.delete.mockRejectedValue(
      Object.assign(new Error("Record not found"), { code: "P2025" }),
    );

    await expect(deleteSubscriber("missing")).resolves.toEqual({
      success: false,
      error: "Subscriber not found.",
    });
  });
});



