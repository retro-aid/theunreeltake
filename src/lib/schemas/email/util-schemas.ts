import * as z from "zod";

const defaultListLimit = z.number().gt(0).max(100).default(25);

/**
 * Defines a default pagination schema to be used for Resend endpoints that handle pagination
 *
 * @param limit - The amount of items to return per page
 * @param paginateOption - The pagination type to use. None for no pagination
 * @param before - The id of the item to get items before
 * @param after - The id of the item to get items after
 */
export const PaginationSchema = z.discriminatedUnion("paginateOption", [
  z.object({
    limit: defaultListLimit,
    paginateOption: z.literal("after"),
    after: z.string().nonoptional(),
  }),
  z.object({
    limit: defaultListLimit,
    paginateOption: z.literal("before"),
    before: z.string().nonoptional(),
  }),
  z.object({
    limit: defaultListLimit,
    paginateOption: z.literal("none"),
  }),
]);
