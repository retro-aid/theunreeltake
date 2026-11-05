import * as z from "zod";

/**
 * Shared `visitors` count used by the overview, devices and locations
 * outputs.
 */
const GAVisitorsSchema = z.object({
  visitors: z.number().int().nonnegative(),
});

/**
 * Date range the GA dashboard cards can be filtered by.
 *
 * @remarks
 * Defaults to `30d`, so the input type allows leaving it out but the output
 * is always a real range. `12m` maps to the last 365 days in the GA request.
 */
export const GARangeInputSchema = z.enum(["7d", "30d", "12m"]).default("30d");

// Overall traffic numbers for a date range.
export const GAOverviewOutputSchema = GAVisitorsSchema.extend({
  pageViews: z.number().int().nonnegative(),
});

// Views and average time spent for one blog post.
export const GAPostStatOutputSchema = z.object({
  path: z.string(),
  title: z.string(),
  views: z.number().int().nonnegative(),
  avgTimeSeconds: z.number().nonnegative(),
});

//Visitors on one type of device (desktop, mobile or tablet).
export const GADeviceOutputSchema = GAVisitorsSchema.extend({
  device: z.string(),
});

// Visitors from one country.
export const GALocationOutputSchema = GAVisitorsSchema.extend({
  country: z.string(),
});

export type GARangeInput = z.input<typeof GARangeInputSchema>;
export type GARangeOutput = z.output<typeof GARangeInputSchema>;
export type GAOverviewOutputDTO = z.output<typeof GAOverviewOutputSchema>;
export type GAPostStatOutputDTO = z.output<typeof GAPostStatOutputSchema>;
export type GADeviceOutputDTO = z.output<typeof GADeviceOutputSchema>;
export type GALocationOutputDTO = z.output<typeof GALocationOutputSchema>;
