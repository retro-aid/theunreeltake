import "server-only";
import { AnonymousCommentForm } from "@/lib/schemas/comment-schemas";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import * as crypto from "node:crypto";
import { getCurrentSession } from "@/lib/dal/utils";
import dayjs from "dayjs";
import type { Prisma } from "@/generated/prisma/client";

type CommentWithPostTitle = Awaited<
  ReturnType<typeof getAdminComments>
>[number];
type CommentWithReplies = Awaited<ReturnType<typeof getRepliesOnPost>>[number];

export type CulledComment = Pick<
  CommentWithReplies,
  | "id"
  | "username"
  | "createdAt"
  | "email"
  | "messageContent"
  | "userId"
  | "postId"
  | "postSlug"
  | "repliesToId"
> & {
  repliesReceived?: CommentWithReplies["repliesReceived"];
};
export type CulledAdminComment = Omit<CommentWithPostTitle, "repliesToId">;

async function generateAnonymousUserID() {
  const headersList = await headers();

  const ip =
    headersList.get("x-forwarded-for") || headersList.get("x-real-ip") || "";
  const userAgent = headersList.get("user-agent") || "";

  return crypto.createHash("sha256").update(`${ip}:${userAgent}`).digest("hex");
}

export async function createComment(
  postSlug: string,
  formData: AnonymousCommentForm,
) {
  const { username, email, message } = formData;

  try {
    const associatedPost = await prisma.post.findUniqueOrThrow({
      where: { slug: postSlug },
      select: { slug: true, id: true },
    });

    const anonUserId = await generateAnonymousUserID();

    return await prisma.comment.create({
      data: {
        username: !username ? "Anonymous User" : username,
        email: !email ? null : email,
        messageContent: message,
        userId: anonUserId,
        postSlug: associatedPost.slug,
        postId: associatedPost.id,
      },
    });
  } catch (e) {
    console.error(e);
  }
}

export async function createReply(
  parentCommentId: string,
  messageContent: string,
) {
  try {
    const session = await getCurrentSession();
    const parentComment = await prisma.comment.findUniqueOrThrow({
      where: { id: parentCommentId },
      select: { id: true, postId: true, postSlug: true, repliesToId: true },
    });

    if (parentComment.repliesToId !== null) {
      console.error("No Reply");
      return null;
    }

    return await prisma.comment.create({
      data: {
        username: session.user.name,
        email: session.user.email ?? null,
        messageContent: messageContent,
        userId: session.user.id,
        postId: parentComment.postId,
        postSlug: parentComment.postSlug,
        repliesToId: parentComment.id,
      },
    });
  } catch (error) {
    console.error("No reply", error);
    return null;
  }
}

export async function deleteComment(id: string) {
  try {
    const session = await getCurrentSession();

    if (session.user.role !== "admin") {
      console.error("Unauthorized");
      return;
    }

    return await prisma.comment.delete({
      where: { id: id },
    });
  } catch (e) {
    console.error(e);
  }
}

/**
 * Gets dashboard specific comments based on user role or for a specific post
 *
 * @remarks
 * If a postId is provided, returns only comments for that post.
 * If no postId is provided, returns the general comments for either only a user's posts;
 * Or if the user is an admin, all comments site-wide
 *
 * @param postId - The id of the post to retrieve comments for
 * @returns A list of dashboard-specific comments
 */
export async function getAdminComments(postId?: string) {
  const session = await getCurrentSession();

  if(
    !session.user.role ||
    (session.user.role !== "admin" && session.user.role !== "user")
  )
    return [];

  let whereClause: Prisma.CommentWhereInput | undefined;

  if(postId) {
    whereClause = { postId: postId };
  }
  else if(session.user.role === "user") {
    whereClause = { post: { author: { id: session.user.id } } };
  }

  return prisma.comment.findMany({
    where: whereClause,
    include: {
      post: {
        select: { title: true },
      },
    },
    omit: { repliesToId: true },
    orderBy: { createdAt: "desc" }
  });
}

export async function getCommentsOnPost(postSlug: string) {
  return prisma.comment.findMany({
    where: { postSlug: postSlug },
    orderBy: { createdAt: "desc" },
  });
}

export async function getRepliesOnPost(postSlug: string) {
  return prisma.comment.findMany({
    where: { postSlug: postSlug, repliesToId: null },
    include: { repliesReceived: { orderBy: { createdAt: "desc" } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function getAmountOfComments(period: "month" | "year" | "day") {
  const now = new Date();
  const prev = dayjs(now).subtract(1, period).toDate();

  return prisma.comment.count({
    where: {
      createdAt: {
        lte: now,
        gte: prev,
      },
    },
  });
}
