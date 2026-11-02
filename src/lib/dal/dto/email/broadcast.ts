import "server-only";
import { requireAdmin } from "@/lib/dal/utils";
import { resend } from "@/lib/dal/dto/email/resend";
import { CreateBroadcastOptions, ListBroadcastsOptions } from "resend";
import {
  CreateBroadcastFormInput,
  CreateBroadcastSchema,
  ListBroadcastFormInput,
  ListBroadcastSchema,
} from "@/lib/schemas/email/broadcast-schemas";

/**
 * Gets a list of broadcast objects from Resend
 *
 * @remarks
 * For pagination, you must specify the before or after method.
 * These are mutually exclusive and should be used for previous page and next page queries respectively
 *
 * @param params - The pagination and limit options to apply. Uses the default {@link PaginationSchema}
 */
export async function list(params: ListBroadcastFormInput) {
  await requireAdmin();

  const parsedParams = ListBroadcastSchema.parse(params);

  const { paginateOption, limit } = parsedParams;

  const options: ListBroadcastsOptions = {
    limit: limit,
  };

  if(paginateOption === "after")
    options.after = parsedParams.after;
  else if(paginateOption === "before")
    options.before = parsedParams.before;

  return resend.broadcasts.list(options);
}

/**
 * Creates a new broadcast and sends it at the scheduled time
 *
 * @remarks
 * This function will always create a broadcast and then send
 *
 * @param params - The required parameters needed to send a broadcast. See {@link CreateBroadcastSchema}
 */
export async function create(params: CreateBroadcastFormInput) {
  await requireAdmin();

  const parsed = CreateBroadcastSchema.parse(params);

  // Always create & send
  const options: CreateBroadcastOptions = {
    send: true,
    ...parsed,
  };

  return resend.broadcasts.create(options);
}
