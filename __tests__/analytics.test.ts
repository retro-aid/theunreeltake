import { describe, expect, it, vi } from "vitest";
import prisma from "@/lib/__mocks__/prisma";
import { getPendingRequestCount } from "@/lib/dal/dto/media-requests";
import { getTotalViews } from "@/lib/dal/dto/analytics";

vi.mock(import("server-only"), () => {
  return {};
});

vi.mock(import("@/lib/prisma"));

/*  Test for getting the count of pending requests
    Checks: Total amount of pending requests, 
            Returns zero if there are no pending requests,
            Throws an error when querying fails */
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

  it("Throws an error when it fails to query the database", async () => {
    prisma.request.count.mockRejectedValueOnce(new Error("Database error"));

    await expect(getPendingRequestCount()).rejects.toThrow("Database error");
  });
});

/*  Test for getting the total amount of views
    Checks: Total amount returned, 
            Returns zero if no views, 
            Returns 0 if there is an error querying */

describe("getTotalViews", () => {
  it("returns the number of total views", async () => {
    prisma.post.aggregate.mockResolvedValueOnce({
      _sum: { views: 150 },
    } as any);

    const totalViews = await getTotalViews();

    expect(totalViews).toBe(150);
  });

  it("returns 0 when the total amount of views equal 0", async () => {
    prisma.post.aggregate.mockResolvedValueOnce({ _sum: { views: 0 } } as any);

    const totalViews = await getTotalViews();

    expect(totalViews).toBe(0);
  });

  it("returns a 0 when it fails to query the database", async () => {
    prisma.post.aggregate.mockRejectedValueOnce(new Error("Database error"));

    const totalViews = await getTotalViews();

    expect(totalViews).toBe(0);
  });
});
