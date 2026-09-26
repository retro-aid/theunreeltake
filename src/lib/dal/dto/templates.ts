import 'server-only';
import prisma from "@/lib/prisma";
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';

export async function createPostTemplate(
    formData: {
    title: string,
    description: string,
    htmlContent: string,
    isPublic: boolean,
  }) {
    try
    {
      const session = await auth.api.getSession({
        headers: await headers()
      });

      if(!session || !session.user) {
        return { error: "You must be logged in to create a post template.", success: false };
      }
      const result = await prisma.postTemplate.create({
        data: {
          id: crypto.randomUUID(),
          title: formData.title,
          description: formData.description,
          htmlContent: formData.htmlContent,
          isPublic: formData.isPublic,
          authorId: session.user.id,
        }
      });
      revalidatePath("/dashboard/templates");
      return { error: null, success: true };
    } catch (error) {
      console.error("PRISMA DATABASE ERROR:", error);
      revalidatePath("/dashboard/templates");
      return { error: "Failed to save post template", success: false };
    }
}

export async function getPostTemplates(Id?: string) {
  const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session || !session.user) {
      return { success: false, data: [] };
    }
  
  try {
    const templates = await prisma.postTemplate.findMany({
      where: Id ? { NOT: { id: Id } } : {
        OR: [
          {authorId: session.user.id},
          {isPublic: true}
        ]},
      orderBy: {
        updatedAt: 'desc'
      }
    });
    revalidatePath("/dashboard/templates");
    return { success: true, data: templates };
  } catch (e) {
      console.error("Error fetching post templates:", e);
      revalidatePath("/dashboard/templates");
      return { success: false, data: [] };
  }
}

export async function updatePostTemplate(
  formData: {
    id: string,
    title: string,
    description: string,
    htmlContent: string,
    isPublic: boolean,
  }) {
    try{
      await prisma.postTemplate.update({
      where: {
        id: formData.id,
      },
      data: {
        title: formData.title,
        description: formData.description,
        htmlContent: formData.htmlContent,
        isPublic: formData.isPublic
      }
    });

    revalidatePath("/dashboard/templates");
    return { error: null, success: true};
    } catch (error) {
      revalidatePath("/dashboard/templates");
      return { error: "Failed to save post template", success: false };
    }
  }

export async function deletePostTemplate(id: string) {
  try
  {
    await prisma.postTemplate.delete({
      where:{
        id: id,
      }
    });

    revalidatePath("/dashboard/templates");
    return { error: null, success: true};
  } catch (error) {
    
    revalidatePath("/dashboard/templates");
    return { error: "Failed to delete post template", success: false };
  }
}