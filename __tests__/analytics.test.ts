import { describe, expect, it, vi } from "vitest";
import prisma from "@/lib/__mocks__/prisma";
import { getPendingRequestCount } from "@/lib/dal/dto/media-requests";
import { getTotalViews } from "@/lib/dal/dto/analytics";
import { getTotalViews, getTotalActiveUsers } from "@/lib/dal/dto/analytics";
import { getTotalActiveUsersAction } from "@/lib/actions/analytics-actions";

vi.mock(import("server-only"), () => {
  return {};
});

vi.mock(import("@/lib/prisma"));

describe("getTotalActiveUsers", () => {
  it("returns the count of users in the database", async () => {
    const mockCount = 1;

    // Mock that user count resolves to 1
    prisma.user.count.mockResolvedValueOnce(mockCount);

    // Test function
    const countOfUsers = await getTotalActiveUsersAction();

    // Assertion
    expect(countOfUsers).toEqual(mockCount);
  });

  it("returns 0 if the database throws an error", async () => {
    // Mock that the database query fails
    prisma.user.count.mockRejectedValueOnce("Some database error");

    // Test function
    const countOfUsers = await getTotalActiveUsers();

    // Assertion
    expect(countOfUsers).toEqual(0);
  });

  it("logs an error to the console once when database throws an error", async () => {
    // Spy on console output
    const consoleSpy = vi.spyOn(console, "error");

    const mockErrorLog = "Some database error";

    // Mock that the database query fails
    prisma.user.count.mockRejectedValueOnce(mockErrorLog);

    // Test function
    await getTotalActiveUsers();

    // Assertion
    expect(consoleSpy).toHaveBeenCalledOnce();
    expect(consoleSpy).toHaveBeenCalledWith(mockErrorLog);
  });
});

/**
 * Tests for getting the count of pending requests
 *
 * Checks:
 *    Total amount of pending requests
 *    Returns zero if there are no pending requests
 *    Throws an error when querying fails
 */
describe("getPendingRequestCount", () => {
  it("returns the number of pending requests", async () => {
    prisma.request.count.mockResolvedValueOnce(5);

    const requests = await getPendingRequestCount();

    expect(requests).toBe(5);
  });

  it("returns 0 when no requests are pending", async () => {
    prisma.request.count.mockResolvedValueOnce(0);

    const requests = await getPendingRequestCount();

    expect(requests).toBe(0);
  });

  it("throws an error when it fails to query the database", async () => {
    prisma.request.count.mockRejectedValueOnce(new Error("Database error"));

    await expect(getPendingRequestCount()).rejects.toThrow("Database error");
  });
});

/**
 * Tests for getting the total amount of views
 *
 * Checks:
 *    Total amount returned
 *    Returns zero if no views
 *    Returns 0 if there is an error querying
 *
 */
describe("getTotalViews", () => {
  it("returns the number of total views", async () => {
    prisma.post.aggregate.mockResolvedValueOnce({
      _sum: { views: 150 },
    } as never);

    const totalViews = await getTotalViews();

    expect(totalViews).toBe(150);
  });

  it("returns 0 when the total amount of views equal 0", async () => {
    prisma.post.aggregate.mockResolvedValueOnce({
      _sum: { views: 0 },
    } as never);

    const totalViews = await getTotalViews();

    expect(totalViews).toBe(0);
  });

  it("returns a 0 when it fails to query the database", async () => {
    prisma.post.aggregate.mockRejectedValueOnce(new Error("Database error"));

    const totalViews = await getTotalViews();

    expect(totalViews).toBe(0);

describe("getTotalActiveUsers", () => {
  it("returns the count of users in the database", async () => {
    const mockCount = 1;

    // Mock that user count resolves to 1
    prisma.user.count.mockResolvedValueOnce(mockCount);

    // Test function
    const countOfUsers = await getTotalActiveUsersAction();

    // Assertion
    expect(countOfUsers).toEqual(mockCount);
  });

  it("returns 0 if the database throws an error", async () => {
    // Mock that the database query fails
    prisma.user.count.mockRejectedValueOnce("Some database error");

    // Test function
    const countOfUsers = await getTotalActiveUsers();

    // Assertion
    expect(countOfUsers).toEqual(0);
  });

  it("logs an error to the console once when database throws an error", async () => {
    // Spy on console output
    const consoleSpy = vi.spyOn(console, "error");

    const mockErrorLog = "Some database error";

    // Mock that the database query fails
    prisma.user.count.mockRejectedValueOnce(mockErrorLog);

    // Test function
    await getTotalActiveUsers();

    // Assertion
    expect(consoleSpy).toHaveBeenCalledOnce();
    expect(consoleSpy).toHaveBeenCalledWith(mockErrorLog);
  });
});
