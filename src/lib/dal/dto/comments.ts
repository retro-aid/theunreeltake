import 'server-only';
import {AnonymousCommentForm} from "@/lib/schemas/comment-schemas";
import prisma from "@/lib/prisma";
import {headers} from "next/headers";
import * as crypto from "node:crypto";
import {getCurrentSession} from "@/lib/dal/utils";
import {Comment} from "@/generated/prisma/client";
import dayjs from "dayjs";


type CommentWithPostTitle = Awaited<ReturnType<typeof getAdminComments>>[number];
type CommentWithReplies = Awaited<ReturnType<typeof getRepliesOnPost>>[number];

export type CulledComment = Pick<
  CommentWithReplies,
  "id" | "username" | "createdAt" | "email" | "messageContent" | "userId" | "postId" | "postSlug" | "repliesToId">
 & {
  repliesReceived?: CommentWithReplies["repliesReceived"];
};
export type CulledAdminComment = Omit<CommentWithPostTitle, "repliesToId">;
//export type CulledReplyComment = Pick<CommentWithReplies, "id" | "createdAt" | "email" | "messageContent" |  "userId" | "postId" | "repliesToId" | "repliesReceived">;

async function generateAnonymousUserID() {

  const headersList = await headers();

  const ip = headersList.get("x-forwarded-for") || headersList.get("x-real-ip") || "";
  const userAgent = headersList.get("user-agent") || "";

  return crypto.createHash("sha256").update(`${ip}:${userAgent}`).digest("hex");
}



export async function createComment(
  postSlug: string,
  formData: AnonymousCommentForm
) {

  const { username, email, message } = formData;

  try {

    const associatedPost = await prisma.post.findUniqueOrThrow({
      where: { slug: postSlug },
      select: { slug: true, id: true }
    });

    const anonUserId = await generateAnonymousUserID();

    return await prisma.comment.create({
      data: {
        username: (!username) ? "Anonymous User" : username,
        email: (!email) ? null : email,
        messageContent: message,
        userId: anonUserId,
        postSlug: associatedPost.slug,
        postId: associatedPost.id
      }
    });

  } catch(e) {
    console.error(e);
  }
}

export async function createReply(
  parentCommentId: string,
  messageContent: string
) {
  try{
    const session = await getCurrentSession();
    const parentComment = await prisma.comment.findUniqueOrThrow({
      where: {id: parentCommentId},
      select: {id: true, postId: true, postSlug: true, repliesToId: true}
      
    });

    if(parentComment.repliesToId !== null)
    {
      console.error("No Reply")
    }

    return await prisma.comment.create({
      data: {
        username: session.user.name,
        email: session.user.email ?? null,
        messageContent: messageContent,
        userId: session.user.id,
        postId: parentComment.postId,
        postSlug: parentComment.postSlug,
        repliesToId: parentComment.id
      }
    });
  } catch (error) {
    console.error("No reply", error)
    return null;
  }
}



export async function deleteComment(
  id: string
) {

  try {

    const session = await getCurrentSession();

    if(session.user.role !== "admin") {
      console.error("Unauthorized");
      return;
    }

    return await prisma.comment.delete({
      where: { id: id }
    });
  } catch (e) {
    console.error(e);
  }
}



export async function getAdminComments() {

  const session = await getCurrentSession();

  if(session.user.role === "user") {

    return prisma.comment.findMany({
      where: {
        post: {
          author: {
            id: session.user.id
          }
        }
      },
      include: {
        post: {
          select: { title: true }
        }
      },
      omit: { repliesToId: true },
      orderBy: { createdAt: "desc" }
    });

  } else if(session.user.role === "admin") {

    return prisma.comment.findMany({
      omit: {repliesToId: true},
      include: {
        post: { select: { title: true } }
      },
      orderBy: { createdAt: "desc" }
    });

  }else {
    return [];
  }
}



export async function getCommentsOnPost(
  postSlug: string
) {

  return prisma.comment.findMany({
    where: { postSlug: postSlug },
    orderBy: { createdAt: "desc" }
  });
}

export async function getRepliesOnPost(
  postSlug: string
) {
  return prisma.comment.findMany({
    where: { postSlug: postSlug, repliesToId: null},
    include: { repliesReceived: {orderBy: {createdAt: "desc"}}},
    orderBy: {createdAt: "desc"}
  })
}

export async function getAmountOfComments(
  period: "month" | "year" | "day"
) {

  const now = new Date();
  const prev = dayjs(now).subtract(1, period).toDate();

  return prisma.comment.count({
    where: {
      createdAt: {
        lte: now,
        gte: prev
      }
    }
  });
}