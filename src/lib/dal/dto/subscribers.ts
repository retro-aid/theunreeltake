import "server-only";
import type { Prisma, Subscriber } from "@/generated/prisma/client";
import prisma from "@/lib/prisma";
import { getCurrentSession } from "@/lib/dal/utils";
import {
  CreateSubscriberSchema,
  UpdateSubscriberSchema,
  type CreateSubscriberInput,
  type UpdateSubscriberInput,
} from "@/lib/schemas/subscriber-schemas";
import { revalidatePath } from "next/cache";

export type SubscriberDTO = Pick<
  Subscriber,
  "id" | "firstName" | "lastName" | "email" | "subDate"
>;
export type ListSubscribersOptions = {
  page?: number;
  limit?: number;
  search?: string;
  sort?: "email-asc" | "email-desc" | "subDate-asc" | "subDate-desc";
};
export type ListSubscribersResult = {
  success: boolean;
  data: SubscriberDTO[];
  total: number;
  error?: string;
};

const SUBSCRIBER_ORDER_BY: Record<
  NonNullable<ListSubscribersOptions["sort"]>,
  Prisma.SubscriberOrderByWithRelationInput
> = {
  "email-asc": { email: "asc" },
  "email-desc": { email: "desc" },
  "subDate-asc": { subDate: "asc" },
  "subDate-desc": { subDate: "desc" },
};

/**
 * Confirms that the current session belongs to an administrator.
 * @returns Whether the current user is an administrator.
 */
async function isAdmin(): Promise<boolean> {
  try {
    const session = await getCurrentSession();
    return session.user.role?.toLowerCase() === "admin";
  } catch {
    return false;
  }
}

/**
 * Lists subscribers with pagination, optional search, and a supported sort.
 * @param options - Pagination, search, and sorting options.
 * @returns Subscriber rows and total count, or an empty result on failure.
 */
export async function listSubscribers({
  page = 1,
  limit = 20,
  search = "",
  sort = "subDate-desc",
}: ListSubscribersOptions = {}): Promise<ListSubscribersResult> {
  if (!(await isAdmin())) {
    return { success: false, data: [], total: 0, error: "Unauthorized" };
  }

  const safePage = Number.isInteger(page) && page > 0 ? page : 1;
  const safeLimit = Number.isInteger(limit)
    ? Math.min(Math.max(limit, 1), 100)
    : 20;
  const normalizedSearch = search.trim();
  const where: Prisma.SubscriberWhereInput = normalizedSearch
    ? {
        OR: [
          { email: { contains: normalizedSearch, mode: "insensitive" } },
          { firstName: { contains: normalizedSearch, mode: "insensitive" } },
          { lastName: { contains: normalizedSearch, mode: "insensitive" } },
        ],
      }
    : {};

  try {
    const [subscribers, total] = await Promise.all([
      prisma.subscriber.findMany({
        where,
        orderBy: SUBSCRIBER_ORDER_BY[sort] ?? { subDate: "desc" },
        skip: (safePage - 1) * safeLimit,
        take: safeLimit,
      }),
      prisma.subscriber.count({ where }),
    ]);

    return { success: true, data: subscribers, total };
  } catch (error) {
    console.error("Failed to list subscribers:", error);
    return {
      success: false,
      data: [],
      total: 0,
      error: "Failed to load subscribers.",
    };
  }
}

/**
 * Retrieves one subscriber by its database identifier.
 * @param id - The subscriber identifier.
 * @returns The subscriber, or null when it does not exist or access is denied.
 */
export async function getSubscriber(
  id: string,
): Promise<SubscriberDTO | null> {
  if (!(await isAdmin()) || !id.trim()) return null;

  try {
    return await prisma.subscriber.findUnique({ where: { id } });
  } catch (error) {
    console.error("Failed to get subscriber:", error);
    return null;
  }
}

/**
 * Creates a subscriber after validating the supplied fields.
 * @param input - Subscriber details submitted by an administrator.
 * @returns The created subscriber or a user-safe error result.
 */
export async function createSubscriber(input: CreateSubscriberInput) {
  if (!(await isAdmin())) {
    return { success: false as const, error: "Unauthorized" };
  }

  const parsed = CreateSubscriberSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false as const, error: parsed.error.issues[0]?.message };
  }

  try {
    const existingSubscriber = await prisma.subscriber.findFirst({
      where: { email: { equals: parsed.data.email, mode: "insensitive" } },
      select: { id: true },
    });
    if (existingSubscriber) {
      return {
        success: false as const,
        error: "A subscriber with this email already exists.",
      };
    }

    const subscriber = await prisma.subscriber.create({ data: parsed.data });
    revalidatePath("/dashboard/newsletter");
    return { success: true as const, data: subscriber };
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "P2002") {
      return {
        success: false as const,
        error: "A subscriber with this email already exists.",
      };
    }
    console.error("Failed to create subscriber:", error);
    return { success: false as const, error: "Failed to add subscriber." };
  }
}

/**
 * Updates supported fields for an existing subscriber.
 * @param id - The subscriber identifier.
 * @param input - Fields to update.
 * @returns The updated subscriber or a user-safe error result.
 */
export async function updateSubscriber(
  id: string,
  input: UpdateSubscriberInput,
) {
  if (!(await isAdmin())) {
    return { success: false as const, error: "Unauthorized" };
  }
  if (!id.trim()) {
    return { success: false as const, error: "Subscriber ID is required." };
  }

  const parsed = UpdateSubscriberSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false as const, error: parsed.error.issues[0]?.message };
  }

  try {
    if (parsed.data.email) {
      const existingSubscriber = await prisma.subscriber.findFirst({
        where: {
          email: { equals: parsed.data.email, mode: "insensitive" },
          NOT: { id },
        },
        select: { id: true },
      });
      if (existingSubscriber) {
        return {
          success: false as const,
          error: "A subscriber with this email already exists.",
        };
      }
    }

    const subscriber = await prisma.subscriber.update({
      where: { id },
      data: parsed.data,
    });
    revalidatePath("/dashboard/newsletter");
    return { success: true as const, data: subscriber };
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "P2002") {
      return {
        success: false as const,
        error: "A subscriber with this email already exists.",
      };
    }
    if (error instanceof Error && "code" in error && error.code === "P2025") {
      return { success: false as const, error: "Subscriber not found." };
    }
    console.error("Failed to update subscriber:", error);
    return { success: false as const, error: "Failed to update subscriber." };
  }
}

/**
 * Deletes a subscriber by identifier.
 * @param id - The subscriber identifier.
 * @returns A success result or a user-safe error result.
 */
export async function deleteSubscriber(id: string) {
  if (!(await isAdmin())) {
    return { success: false as const, error: "Unauthorized" };
  }
  if (!id.trim()) {
    return { success: false as const, error: "Subscriber ID is required." };
  }

  try {
    await prisma.subscriber.delete({ where: { id } });
    revalidatePath("/dashboard/newsletter");
    return { success: true as const };
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "P2025") {
      return { success: false as const, error: "Subscriber not found." };
    }
    console.error("Failed to delete subscriber:", error);
    return { success: false as const, error: "Failed to delete subscriber." };
  }
}



