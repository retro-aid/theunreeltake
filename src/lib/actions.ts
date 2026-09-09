"use server";

import {CreateTagFom, RequestForm} from "@/lib/schemas";
import prisma from "@/lib/prisma";
import {cookies, headers} from "next/headers";
import { auth } from "@/lib/auth";
import * as crypto from "node:crypto";
import dayjs from "dayjs";
import {Tag, Verification} from "@/generated/prisma/client";
import { sendInvitationEmail } from "@/lib/emailer";
import { sendPasswordWasResetEmail } from "@/lib/emailer";
import {revalidatePath} from "next/cache";
import {AllowedTagType, PostItem} from "./constants";
import { RequestWhereInput, RequestOrderByWithRelationInput } from "@/generated/prisma/models/Request";

const REQUEST_ORDER_BY: Record<string, RequestOrderByWithRelationInput> = {
  title: { title: "asc" },
  name:  { name: "asc" },
  email: { email: "asc" },
};


function generateInvitationToken(): string {

  const byteLength = 6;

  const bytes = crypto.randomBytes(byteLength);

  let code = "";

  bytes.forEach((byte) => {
    code += String.fromCharCode((byte % 26) + 65);
  });

  return code;
}

export async function createInvitationVerification(email: string) {

  const now = new Date();
  const token = generateInvitationToken();
  const data = {
    id: crypto.randomUUID(),
    identifier: token,
    value: email,
    createdAt: now,
    updatedAt: now,
    expiresAt: dayjs(now).add(7, "day").toDate()
  }

  await prisma.verification.create({
    data: data
  });

  await sendInvitationEmail(email, token);
}

export async function verifyInvitationToken(token: string): Promise<{data: Verification | null, error: string | null}> {

  const verification = await prisma.verification.findFirst({
    where: {
      identifier: token
    }
  });

  if(!verification)
    return { data: null, error: "Invalid Token" }

  if(verification.expiresAt < new Date()) {

    await deleteInvitationToken(verification.id);

    return {data: null, error: "Token Expired"}
  }

  return { data: verification, error: null };
}

export async function deleteInvitationToken(id: string): Promise<{ statusMessage: string, success: boolean }> {

  try {
    await prisma.verification.delete({
      where: {
        id: id
      }
    });
  } catch (error) {
    return { statusMessage: "Error deleting invitation token", success: false }
  }

  return { statusMessage: "Successfully deleted token", success: true }
}

// Removed sendUserInvitaion,
// Only needs to check if the user exists
export async function checkUserExists(email: string) {
  try {
    const existingUser = await prisma.user.findUnique({
      where: {
        email: email.toLowerCase()
      }
    });

    // Returns true if the user exists and false if they dont
    return !!existingUser;
  } catch (error) {
    console.error("Database Error: ", error);
    return true;
  }
}

export async function notifyPasswordChanged() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (session && session.user) {
    await sendPasswordWasResetEmail({
      name: session.user.name,
      email: session.user.email
    });
  }
}

export async function createNewPost(
  formData: {
    title: string,
    slug: string,
    mediaTagId: number,
    pageContent: string,
    published: boolean,
    posterUrl: string | null
  }
){
  try {

    const session = await auth.api.getSession({
      headers: await headers()
    });

    if(!session || !session.user) {
      return { error: "You must be logged in to create a post.", success: false };
    }
    const result = await prisma.post.create({
      data: {
        title: formData.title,
        slug: formData.slug,
        htmlContent: formData.pageContent,
        posterUrl: formData.posterUrl,
        published: formData.published,
        authorId: session.user.id,
      }
    });

    await prisma.tagsOnPost.create({
      data: {
        tagId: formData.mediaTagId,
        postId: result.id
      }
    })

    return { error: null, success: true };
  } catch (error) {
    console.error("PRISMA DATABASE ERROR:", error);
    return { error: "Failed to save post", success: false };
  }
}

export async function createTriviaCookie() {

  const cookieStore = await cookies();

  cookieStore.set({
    name: "unreel",
    value: "",
    priority: "low",
    httpOnly: true,
    sameSite: "strict",
    expires: dayjs(new Date()).add(1, "year").toDate()
  });
}

export async function deleteUser(id : string){
  try{
      const deleteUser = await prisma.user.delete({
        where: {id},
      });
    revalidatePath("/dashboard/users")
    return {data: deleteUser, error: "none"};
  } catch(e){
    console.error("Database Error: ", e);
    return {data: null, error: "User not found"};
  }
}

export async function getAllUsers(Id?: string) {
  try {
    return await prisma.user.findMany({
      where: Id ? { NOT: { id: Id } } : undefined,
    });
  } catch (e) {
    console.error("Error fetching users:", e);
    return null;
  }
}

export async function deletePost(id:string)
{
  try
  {
    await prisma.post.delete({
      where:{
        id: id,
      }
    });

    return { error: null, success: true};
  } catch (error) {
    return { error: "Failed to delete post", success: false };
  }
}

export async function savePost(
  id: string,
  title: string,
  slug: string,
  content: string,
  published: boolean,
  posterUrl: string | null,
  mediaTagId: number
)
{
  try
  {

    await prisma.tagsOnPost.deleteMany({
      where: {
        postId: id
      }
    });

    await prisma.post.update({
      where: {
        id: id,
      },
      data: {
        title: title,
        slug: slug,
        posterUrl: posterUrl,
        htmlContent: content,
        published: published,
        tags: {
          create: {
            tag: { connect: { id: mediaTagId }}
          }
        }
      }
    });

    return { error: null, success: true};
  } catch (error) {
    return { error: "Failed to save post", success: false };
  }
}

export async function deleteTag(id: number) {

  try {
    await prisma.tag.delete({where: {id: id}});

    revalidatePath("/dashboard/tags");
    return { error : null, success: true };

  } catch (error) {
    return { error: error, success: false };
  }
}

export async function createTag(tag: CreateTagFom) {

  try {

    await prisma.tag.create({
      data: { displayName: tag.name, type: tag.type }
    });

    revalidatePath("/dashboard/tags");

    return { error: null, success: true };

  } catch (error) {
    return { error: error, success: false };
  }
}

export async function getDraftPosts() {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session || !session.user) {
      return { success: false, data: [] };
    }

    const draftPosts = await prisma.post.findMany({
      where: {
        authorId: session.user.id,
        published: false,
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    const formattedDrafts = draftPosts.map((post) => ({
      id: post.id,
      imageSrc: post.posterUrl || "https://placehold.co/600x400?text=No+Poster",
    }));

    return { success: true, data: formattedDrafts };
  } catch (error) {
    console.error("Failed to fetch drafts:", error);
    return { success: false, data: [] };
  }
}

export async function getPostAction({
  authorId,
  page = 1,
  limit = 10,
  search = ""
}: {
  authorId: string,
  page?: number,
  limit?: number,
  search?: string,
}) {

  try {
    const posts = await prisma.post.findMany({
      where: {
        title: {
          contains: search,
          mode: "insensitive",
        },
        published: true,
        authorId: authorId
      },
      orderBy: {
        createdAt: "desc",
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    const total = await prisma.post.count({
      where: {
        title: {
          contains: search,
          mode: "insensitive",
        },
      },
    });

    const formatted: PostItem[] = posts.map((post) => ({
      id: post.id,
      title: post.title,
      imageSrc: post.posterUrl ?? "https://placehold.co/600x400?text=No+Poster",
    }));

    return {
      success: true,
      data: formatted,
      total,
    };
  } catch (err) {
    console.error(err);
    return {
      success: false,
      data: [],
      total: 0,
    };
  }
}

export async function submitRequestForm(data: RequestForm){
  try{
    await prisma.request.create({
      data: {
				email: data.email,
				title: data.title,
				message: data.message ?? "",
				type: data.mediaType,
				name: data.name ?? null,
			},
        });
    return{e: null, success: true};
    }
    catch(e){
      return {e: "Failed to submit form", success: false}
    }

}


export async function getMediaRequests({
  page = 1,
  limit = 12,
  search = "",
  type = "",
  sort = "",
}: {
  page?: number;
  limit?: number;
  search?: string;
  type?: string;
  sort?: string;
}) {
  try {
    const where: RequestWhereInput = {
      type: type || undefined,
      OR: search
        ? [
            { title: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
            { name:  { contains: search, mode: "insensitive" } },
          ]
        : undefined,
    };

    const [data, total] = await Promise.all([
      prisma.request.findMany({
        where,
        orderBy: REQUEST_ORDER_BY[sort] ?? { name: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.request.count({ where }),
    ]);

    return { success: true, data, total };
  } catch (error) {
    console.error(error);
    return { success: false, data: [] as [], total: 0 };
  }
}

export async function updateUser(id:string, name:string, role:string)
{
  try{
    await prisma.user.update({
      where:{
        id:id,
      },
      data: {
        name: name,
        role: role
      }
    });

    revalidatePath("/dashboard/users");

    return {error: null, success: true};
  } catch (error) {
    return {error: "Failed to update user",success:false};
  }
}

export async function getAllTags(tagType: AllowedTagType | undefined) {

  try {

    let result: Tag[];

    if(!tagType) {
      result = await prisma.tag.findMany();
    } else {
      result = await prisma.tag.findMany({
        where: {
          type: tagType
        }
      });
    }

    return { error: null, data: result };

  } catch (error) {
    return { error: "Failed to fetch tags", data: null }
  }
}