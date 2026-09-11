import 'server-only';
import {AnonymousCommentForm} from "@/lib/schemas/comment-schemas";
import prisma from "@/lib/prisma";
import {headers} from "next/headers";
import * as crypto from "node:crypto";

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
        username: username ?? "Anonymous User",
        email: email ?? null,
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