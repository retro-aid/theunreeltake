import { describe, expect, it, vi } from "vitest";
import prisma from "@/lib/__mocks__/prisma";
import { getPendingRequestCount } from "@/lib/dal/dto/media-requests";
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
