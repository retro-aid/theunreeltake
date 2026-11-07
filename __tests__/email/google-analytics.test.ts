import { describe, it, expect, vi, beforeEach } from "vitest";
import prisma from "@/lib/__mocks__/prisma";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import {
  getGAOverview,
  getGAPostStats,
  getGADevices,
  getGALocations,
} from "@/lib/dal/dto/google-analytics";

vi.mock(import("server-only"), () => {
  return {};
});

vi.mock(import("@/lib/prisma"));
vi.mock("next/headers", () => ({ headers: vi.fn() }));
vi.mock("@/lib/auth", () => ({ auth: { api: { getSession: vi.fn() } } }));

// Creating mock for Google Analytics method runReport which helps prevent real requests made to Google
const mocks = vi.hoisted(() => ({ runReport: vi.fn() }));
vi.mock("@google-analytics/data", () => ({
  BetaAnalyticsDataClient: class {
    runReport = mocks.runReport;
  },
}));
// Creating mock for caching so that each function uses its own data
vi.mock("next/cache", () => ({
  unstable_cache: (callback: (...args: any[]) => any) => callback,
}));

beforeEach(() => {
  vi.clearAllMocks();

  vi.mocked(headers).mockResolvedValue(
    new Headers({ "user-agent": "vitest" }) as never,
  );

  vi.mocked(auth.api.getSession).mockResolvedValue({
    user: { id: "TestUser" },
  } as never);

  prisma.post.findMany.mockResolvedValue([]);
});

/**
 * Tests for getting page views, and unique visitors
 *
 * Checks:
 *    returns the correct views and unique visiters
 *    checks for the correct date range
 *    returns zero when GA has no metrics
 *    rejects if the user is not logged in
 *    rejects if date range is invalid
 *    rejects if GA fails
 */
describe("getGAOverview", () => {
  it("returns the page views and unique visitors", async () => {
    mocks.runReport.mockResolvedValueOnce([
      {
        rows: [
          {
            metricValues: [{ value: "6767" }, { value: "670" }],
          },
        ],
      },
    ]);

    const getGAResults = await getGAOverview();

    expect(getGAResults).toStrictEqual({ pageViews: 6767, visitors: 670 });
  });

  it.each([
    ["7d", "7daysAgo"],
    ["30d", "30daysAgo"],
    ["12m", "365daysAgo"],
  ] as const)("uses the correct data range %s", async (range, startDate) => {
    mocks.runReport.mockResolvedValueOnce([{ rows: [] }]);
    await getGAOverview(range);

    expect(mocks.runReport).toHaveBeenLastCalledWith(
      expect.objectContaining({
        dateRanges: [{ startDate, endDate: "today" }],
      }),
    );
  });

  it("returns zero when there are no metrics", async () => {
    mocks.runReport.mockResolvedValueOnce([
      {
        rows: [
          {
            metricValues: [],
          },
        ],
      },
    ]);

    const getGAResults = await getGAOverview();

    expect(getGAResults).toStrictEqual({ pageViews: 0, visitors: 0 });
  });

  it("rejects when no one is logged in", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce(null as never);

    await expect(getGAOverview()).rejects.toThrow("Unauthorized");

    expect(mocks.runReport).not.toHaveBeenCalled();
  });

  it("rejects when date range is invalid", async () => {
    await expect(getGAOverview("invalid" as never)).rejects.toThrow();

    expect(mocks.runReport).not.toHaveBeenCalled();
  });

  it("rejects when GA requests fail", async () => {
    mocks.runReport.mockRejectedValueOnce(new Error("GA API has an error"));

    await expect(getGAOverview()).rejects.toThrow("GA API has an error");
  });
});

/**
 * Tests for getting views and average time spent on each blog post
 *
 * Checks:
 *    retuns the post path, title, views and average time
 *    returns 0 avg time when a post has no views
 *    if post gets deleted it should show the slug
 *    checks for post limit
 *    rejects if the user is not logged in
 *    rejects if date range is invalid
 *    rejects if GA fails
 *    rejects if the query fails
 *
 */
describe("getGAPostStats", () => {
  it("returns the posts path, title, views and average time in seconds", async () => {
    mocks.runReport.mockResolvedValueOnce([
      {
        rows: [
          {
            dimensionValues: [{ value: "/blog/test-post" }],
            metricValues: [{ value: "100" }, { value: "500" }],
          },
        ],
      },
    ]);

    prisma.post.findMany.mockResolvedValueOnce([
      { slug: "test-post", title: "Test Post Review" },
    ] as never);

    const results = await getGAPostStats();

    expect(results).toStrictEqual([
      {
        path: "/blog/test-post",
        title: "Test Post Review",
        views: 100,
        avgTimeSeconds: 5,
      },
    ]);

    expect(prisma.post.findMany).toHaveBeenCalledWith({
      where: { slug: { in: ["test-post"] } },
      select: { slug: true, title: true },
    });
  });

  it("returns 0 average time when a post has no views", async () => {
    mocks.runReport.mockResolvedValueOnce([
      {
        rows: [
          {
            dimensionValues: [{ value: "/blog/test-post" }],
            metricValues: [{ value: "0" }, { value: "500" }],
          },
        ],
      },
    ]);
    const results = await getGAPostStats();

    expect(results[0].avgTimeSeconds).toBe(0);
  });

  it("shows the slug if post gets deleted", async () => {
    mocks.runReport.mockResolvedValueOnce([
      {
        rows: [
          {
            dimensionValues: [{ value: "/blog/deleted-post" }],
            metricValues: [{ value: "100" }, { value: "500" }],
          },
        ],
      },
    ]);

    prisma.post.findMany.mockResolvedValueOnce([]);

    const results = await getGAPostStats();

    expect(results[0].title).toBe("deleted-post");
  });

  it("limits the number of posts returned to 100", async () => {
    mocks.runReport.mockResolvedValueOnce([{ rows: [] }]);

    await getGAPostStats();

    expect(mocks.runReport).toHaveBeenCalledWith(
      expect.objectContaining({ limit: 100 }),
    );
  });

  it("rejects when no one is logged in", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce(null as never);

    await expect(getGAPostStats()).rejects.toThrow("Unauthorized");

    expect(mocks.runReport).not.toHaveBeenCalled();
  });

  it("rejects when date range is invalid", async () => {
    await expect(getGAPostStats("invalid" as never)).rejects.toThrow();

    expect(mocks.runReport).not.toHaveBeenCalled();
  });

  it("rejects when GA requests fail", async () => {
    mocks.runReport.mockRejectedValueOnce(new Error("GA API has an error"));

    await expect(getGAPostStats()).rejects.toThrow("GA API has an error");
  });

  it("rejects when the database fails to query", async () => {
    mocks.runReport.mockResolvedValueOnce([
      {
        rows: [
          {
            dimensionValues: [{ value: "/blog/test-post" }],
            metricValues: [{ value: "100" }, { value: "500" }],
          },
        ],
      },
    ]);

    prisma.post.findMany.mockRejectedValueOnce(new Error("Database error"));

    await expect(getGAPostStats()).rejects.toThrow("Database error");
  });
});

/**
 * Tests for getting amount of visitors based on device usage
 *
 * Checks:
 *    returns visitors based on the device
 *    unknown is used when device is not desktop, mobile, or tablet
 *    returns an empty array if there are no devices
 *    rejects when no one is logged in
 *    rejects when date range in invalid
 *    rejects when GA fails
 */
describe("getGADevices", () => {
  it("returns visitors based on what device the users used", async () => {
    mocks.runReport.mockResolvedValueOnce([
      {
        rows: [
          {
            dimensionValues: [{ value: "desktop" }],
            metricValues: [{ value: "1000" }],
          },
          {
            dimensionValues: [{ value: "mobile" }],
            metricValues: [{ value: "500" }],
          },
          {
            dimensionValues: [{ value: "tablet" }],
            metricValues: [{ value: "5" }],
          },
        ],
      },
    ]);

    const results = await getGADevices();

    expect(results).toStrictEqual([
      { device: "desktop", visitors: 1000 },
      { device: "mobile", visitors: 500 },
      { device: "tablet", visitors: 5 },
    ]);
  });

  it("unknown is used when the device is unknown", async () => {
    mocks.runReport.mockResolvedValueOnce([
      { rows: [{ dimensionValues: [], metricValues: [{ value: "1000" }] }] },
    ]);

    const results = await getGADevices();

    expect(results).toStrictEqual([{ device: "unknown", visitors: 1000 }]);
  });

  it("returns an empty array when there are no devices", async () => {
    mocks.runReport.mockResolvedValueOnce([{ rows: [] }]);

    const results = await getGADevices();

    expect(results).toStrictEqual([]);
  });

  it("rejects when no one is logged in", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce(null as never);

    await expect(getGADevices()).rejects.toThrow("Unauthorized");

    expect(mocks.runReport).not.toHaveBeenCalled();
  });

  it("rejects when date range is invalid", async () => {
    await expect(getGADevices("invalid" as never)).rejects.toThrow();

    expect(mocks.runReport).not.toHaveBeenCalled();
  });

  it("rejects when GA requests fail", async () => {
    mocks.runReport.mockRejectedValueOnce(new Error("GA API has an error"));

    await expect(getGADevices()).rejects.toThrow("GA API has an error");
  });
});

/**
 * Tests for visitors based on country
 *
 * Checks:
 *    returns the amount of visitors by country
 *    checks for the limit of 10
 *    returns an empty array when there are no locations
 *    checks to see if it uses (not set) when countries are missing
 *    rejects when user is not logged in
 *    rejects when date is invalid
 *    rejects whenGA fails
 */
describe("getGALocations", () => {
  it("returns the the amount of vistors by country", async () => {
    mocks.runReport.mockResolvedValueOnce([
      {
        rows: [
          {
            dimensionValues: [{ value: "United States" }],
            metricValues: [{ value: "1000" }],
          },
          {
            dimensionValues: [{ value: "Japan" }],
            metricValues: [{ value: "6767" }],
          },
        ],
      },
    ]);

    const results = await getGALocations();

    expect(results).toStrictEqual([
      { country: "United States", visitors: 1000 },
      { country: "Japan", visitors: 6767 },
    ]);
  });

  it("limits the results to the top 10 countries", async () => {
    mocks.runReport.mockResolvedValueOnce([{ rows: [] }]);

    await getGALocations();

    expect(mocks.runReport).toHaveBeenCalledWith(
      expect.objectContaining({ limit: 10 }),
    );
  });

  it("returns an empty array when there are no locations", async () => {
    mocks.runReport.mockResolvedValueOnce([{ rows: [] }]);

    const results = await getGALocations();

    expect(results).toStrictEqual([]);
  });

  it("uses (not set) when country is missing", async () => {
    mocks.runReport.mockResolvedValueOnce([
      { rows: [{ dimensionValues: [], metricValues: [{ value: "1000" }] }] },
    ]);

    const results = await getGALocations();

    expect(results).toStrictEqual([{ country: "(not set)", visitors: 1000 }]);
  });

  it("rejects when no one is logged in", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce(null as never);

    await expect(getGALocations()).rejects.toThrow("Unauthorized");

    expect(mocks.runReport).not.toHaveBeenCalled();
  });

  it("rejects when date range is invalid", async () => {
    await expect(getGALocations("invalid" as never)).rejects.toThrow();

    expect(mocks.runReport).not.toHaveBeenCalled();
  });

  it("rejects when GA requests fail", async () => {
    mocks.runReport.mockRejectedValueOnce(new Error("GA API has an error"));

    await expect(getGALocations()).rejects.toThrow("GA API has an error");
  });
});
