import "server-only";
import { BetaAnalyticsDataClient } from "@google-analytics/data";
import { unstable_cache } from "next/cache";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import {
  GADeviceOutputSchema,
  GALocationOutputSchema,
  GAOverviewOutputSchema,
  GAPostStatOutputSchema,
  GARangeInputSchema,
  type GADeviceOutputDTO,
  type GALocationOutputDTO,
  type GAOverviewOutputDTO,
  type GAPostStatOutputDTO,
  type GARangeInput,
  type GARangeOutput,
} from "@/lib/schemas/analytics-schemas";

/** What GA calls each of our date ranges. */
const RANGE_START: Record<GARangeOutput, string> = {
  "7d": "7daysAgo",
  "30d": "30daysAgo",
  "12m": "365daysAgo",
};

/** How long to keep GA results before asking again (30 min). */
const CACHE_SECONDS = 60 * 30;

/** Every blog post URL starts with this. */
const BLOG_PATH_PREFIX = "/blog/";

/** Most posts we'll pull stats for. */
const POST_STATS_LIMIT = 100;

/** How many countries to show. */
const LOCATIONS_LIMIT = 10;

let client: BetaAnalyticsDataClient | null = null;

/**
 * Gets the GA client, or makes it if it doesn't exist yet.
 *
 * @remarks
 * Logs in with the service account from the env vars. The private key has
 * `\n` in `.env` instead of real line breaks, so this swaps them back.
 *
 * @returns The GA client.
 */
function getClient() {
  if (!client) {
    client = new BetaAnalyticsDataClient({
      credentials: {
        client_email: process.env.GA_CLIENT_EMAIL,
        private_key: process.env.GA_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      },
    });
  }
  return client;
}

/**
 * Turns our range into the date range GA wants.
 *
 * @param range - The dashboard range.
 * @returns Start and end date for GA.
 */
function toDateRange(range: GARangeOutput) {
  return { startDate: RANGE_START[range], endDate: "today" };
}

/**
 * Turns a GA value into a number.
 *
 * @remarks
 * GA sends numbers back as strings and skips them when there's no data, so
 * anything missing or weird just becomes 0.
 *
 * @param value - The value from GA.
 * @returns The number, or 0.
 */
function toNumber(value: string | null | undefined) {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
}

/**
 * Gets a rounded average without breaking when dividing by 0.
 *
 * @param total - The total.
 * @param count - What to divide by.
 * @returns The average, or 0 if `count` is 0.
 */
function average(total: number, count: number) {
  return count ? Math.round(total / count) : 0;
}

/**
 * Makes sure someone is logged in.
 *
 * @remarks
 * This has to run before the cached fetch since `headers()` doesn't work
 * inside a cached function.
 *
 * @throws If no one is logged in.
 */
async function requireSession() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    throw new Error("Unauthorized");
  }
}

const fetchOverview = unstable_cache(
  async (range: GARangeOutput): Promise<GAOverviewOutputDTO> => {
    const [report] = await getClient().runReport({
      property: `properties/${process.env.GA_PROPERTY_ID}`,
      dateRanges: [toDateRange(range)],
      metrics: [
        { name: "screenPageViews" },
        { name: "totalUsers" },
        { name: "userEngagementDuration" },
      ],
    });

    const values = report.rows?.[0]?.metricValues ?? [];
    const visitors = toNumber(values[1]?.value);
    const engagement = toNumber(values[2]?.value);

    return GAOverviewOutputSchema.parse({
      pageViews: toNumber(values[0]?.value),
      visitors, // toNumber(values[1]?.value),
      avgEngagementSeconds: average(engagement, visitors),
    });
  },
  ["ga-overview"],
  { revalidate: CACHE_SECONDS },
);

const fetchPostStats = unstable_cache(
  async (range: GARangeOutput): Promise<GAPostStatOutputDTO[]> => {
    const [report] = await getClient().runReport({
      property: `properties/${process.env.GA_PROPERTY_ID}`,
      dateRanges: [toDateRange(range)],
      dimensions: [{ name: "pagePath" }],
      metrics: [
        { name: "screenPageViews" },
        { name: "userEngagementDuration" },
      ],
      dimensionFilter: {
        filter: {
          fieldName: "pagePath",
          stringFilter: { matchType: "BEGINS_WITH", value: BLOG_PATH_PREFIX },
        },
      },
      orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
      limit: POST_STATS_LIMIT,
    });

    const rows = (report.rows ?? []).map((row) => {
      const path = row.dimensionValues?.[0]?.value ?? "";
      const views = toNumber(row.metricValues?.[0]?.value);
      const engagement = toNumber(row.metricValues?.[1]?.value);

      return {
        path,
        slug: path.slice(BLOG_PATH_PREFIX.length),
        views,
        avgTimeSeconds: average(engagement, views),
      };
    });

    const posts = await prisma.post.findMany({
      where: { slug: { in: rows.map((row) => row.slug) } },
      select: { slug: true, title: true },
    });
    const titles = new Map(posts.map((post) => [post.slug, post.title]));

    return GAPostStatOutputSchema.array().parse(
      rows.map(({ slug, ...row }) => ({
        ...row,
        title: titles.get(slug) ?? slug,
      })),
    );
  },
  ["ga-post-stats"],
  { revalidate: CACHE_SECONDS },
);

const fetchDevices = unstable_cache(
  async (range: GARangeOutput): Promise<GADeviceOutputDTO[]> => {
    const [report] = await getClient().runReport({
      property: `properties/${process.env.GA_PROPERTY_ID}`,
      dateRanges: [toDateRange(range)],
      dimensions: [{ name: "deviceCategory" }],
      metrics: [{ name: "totalUsers" }],
      orderBys: [{ metric: { metricName: "totalUsers" }, desc: true }],
    });

    return GADeviceOutputSchema.array().parse(
      (report.rows ?? []).map((row) => ({
        device: row.dimensionValues?.[0]?.value ?? "unknown",
        visitors: toNumber(row.metricValues?.[0]?.value),
      })),
    );
  },
  ["ga-devices"],
  { revalidate: CACHE_SECONDS },
);

const fetchLocations = unstable_cache(
  async (range: GARangeOutput): Promise<GALocationOutputDTO[]> => {
    const [report] = await getClient().runReport({
      property: `properties/${process.env.GA_PROPERTY_ID}`,
      dateRanges: [toDateRange(range)],
      dimensions: [{ name: "country" }],
      metrics: [{ name: "totalUsers" }],
      orderBys: [{ metric: { metricName: "totalUsers" }, desc: true }],
      limit: LOCATIONS_LIMIT,
    });

    return GALocationOutputSchema.array().parse(
      (report.rows ?? []).map((row) => ({
        country: row.dimensionValues?.[0]?.value ?? "(not set)",
        visitors: toNumber(row.metricValues?.[0]?.value),
      })),
    );
  },
  ["ga-locations"],
  { revalidate: CACHE_SECONDS },
);

/**
 * Gets page views, unique visitors and average time spent on the site.
 *
 * @remarks
 * All three come from one GA request. Visitors uses GA's total users so it
 * counts unique people. Cached for 30 min.
 *
 * @param range - `"7d"`, `"30d"` or `"12m"`. Defaults to `"30d"`.
 * @returns Page views and unique visitors
 * @throws If no one is logged in, the range is bad or GA fails.
 */
export async function getGAOverview(range?: GARangeInput) {
  await requireSession();
  return fetchOverview(GARangeInputSchema.parse(range));
}

/**
 * Gets views and average time spent for each blog post, most viewed first.
 *
 * @remarks
 * Only looks at `/blog/` pages so stuff like the catalog and about page
 * don't show up. GA's page titles are just the browser tab title, which is
 * the same for every post. The real titles come from our database using
 * the slug. If a post got deleted it just shows the slug. Average time is
 * per view. Returns up to 100 posts and is cached for 30 min.
 *
 * @param range - `"7d"`, `"30d"` or `"12m"`. Defaults to `"30d"`.
 * @returns Each post's path, title, views and average time in seconds.
 * @throws If no one is logged in, the range is bad or GA fails.
 */
export async function getGAPostStats(range?: GARangeInput) {
  await requireSession();
  return fetchPostStats(GARangeInputSchema.parse(range));
}

/**
 * Gets unique visitors by device, most first.
 *
 * @remarks
 * GA gives the device back as `desktop`, `mobile` or `tablet`. Cached for
 * 30 min.
 *
 * @param range - `"7d"`, `"30d"` or `"12m"`. Defaults to `"30d"`.
 * @returns Each device and how many visitors used it.
 * @throws If no one is logged in, the range is bad or GA fails.
 */
export async function getGADevices(range?: GARangeInput) {
  await requireSession();
  return fetchDevices(GARangeInputSchema.parse(range));
}

/**
 * Gets unique visitors by country, most first.
 *
 * @remarks
 * Only returns the top 10 countries. Cached for 30 min.
 *
 * @param range - `"7d"`, `"30d"` or `"12m"`. Defaults to `"30d"`.
 * @returns Each country and how many visitors came from it.
 * @throws If no one is logged in, the range is bad or GA fails.
 */
export async function getGALocations(range?: GARangeInput) {
  await requireSession();
  return fetchLocations(GARangeInputSchema.parse(range));
}
