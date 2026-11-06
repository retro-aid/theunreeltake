import "server-only";

import {
  CreateBroadcastInputDTO,
  CreateBroadcastInputSchema, CreateBroadcastOutputSchema,
  ListBroadcastInputDTO,
  ListBroadcastInputSchema,
  ListBroadcastOutputDTO,
  ListBroadcastOutputSchema,
} from "@/lib/schemas/email/broadcast-schemas";

import { requireAdmin } from "@/lib/dal/utils";
import { resend, unwrap } from "@/lib/dal/dto/email/resend";
import { CreateBroadcastOptions, ListBroadcastsOptions } from "resend";

/**
 * Gets a list of broadcast objects from Resend
 *
 * @remarks
 * For pagination, you must specify the before or after method.
 * These are mutually exclusive and should be used for previous page and next page queries respectively
 *
 * @param params - The pagination and limit options to apply. Uses the default {@link PaginationSchema}
 */
export async function list(
  params: ListBroadcastInputDTO,
): Promise<ListBroadcastOutputDTO> {
  await requireAdmin();

  const validatedParams = ListBroadcastInputSchema.parse(params);

  const { paginateOption, limit } = validatedParams;

  const options: ListBroadcastsOptions = {
    limit: limit,
  };

  if (paginateOption === "after") options.after = validatedParams.after;
  else if (paginateOption === "before") options.before = validatedParams.before;

  const resolvedResponse = unwrap(await resend.broadcasts.list(options));

  return ListBroadcastOutputSchema.parse(resolvedResponse);
}

/**
 * Creates a new broadcast and sends it at the scheduled time
 *
 * @remarks
 * This function will always create a broadcast and then send
 *
 * @param params - The required parameters needed to send a broadcast. See {@link CreateBroadcastInputDTO}
 */
export async function create(params: CreateBroadcastInputDTO) {
  await requireAdmin();

  const validatedParams = CreateBroadcastInputSchema.parse(params);

  // Always create & send
  const options: CreateBroadcastOptions = {
    send: true,
    ...validatedParams,
  };

  const resolvedResponse = unwrap(await resend.broadcasts.create(options));

  return CreateBroadcastOutputSchema.parse(resolvedResponse);
}
