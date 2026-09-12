import 'server-only';
import {AnonymousCommentForm} from "@/lib/schemas/comment-schemas";
import prisma from "@/lib/prisma";
import {headers} from "next/headers";
import * as crypto from "node:crypto";
import {getCurrentSession} from "@/lib/dal/utils";
import {Comment} from "@/generated/prisma/client";


type CommentWithPostTitle = Awaited<ReturnType<typeof getAdminComments>>[number];

export type CulledComment = Pick<Comment, "username" | "createdAt" | "email" | "messageContent" | "userId">
export type CulledAdminComment = Omit<CommentWithPostTitle, "repliesToId">;

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