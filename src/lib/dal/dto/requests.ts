import "server-only";
import prisma from "@/lib/prisma";
import {
  RequestWhereInput,
  RequestOrderByWithRelationInput,
} from "@/generated/prisma/models/Request";
import { Resend } from "resend";
import { RequestStatus } from "@/generated/prisma/enums";

export type RequestDTO = {
  id: string;
  email: string;
  title: string;
  type: string | null;
  name: string | null;
  message: string | null;
  status: RequestStatus;
};
//dto data separation
export type GetMediaRequestsDTO = {
  data: RequestDTO[];
  total: number;
};

const REQUEST_ORDER_BY: Record<string, RequestOrderByWithRelationInput> = {
  title: { title: "asc" },
  name: { name: "asc" },
  email: { email: "asc" },
};
//returns media request based on given sorting parameters
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
            { name: { contains: search, mode: "insensitive" } },
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
// Resend email service setup
const resend = new Resend(process.env.RESEND_API_KEY);

export async function replyToRequest(
  requestId: string,
  message: string,
) {
  const request = await prisma.request.findUnique({
    where: { id: requestId },
  });

  if (!request) {
    throw new Error("Request not found");
  }

  await resend.emails.send({
    from: "you@yourdomain.com",
    to: request.email,
    subject: `Re: ${request.title}`,
    text: message,
  });

  await prisma.request.update({
    where: { id: requestId },
    data: {
      status: "replied",
    },
  });
}
//handles request deletion
export async function deleteRequest(id:string){
    try {
    await prisma.request.delete({
      where: { id },
    });

    return { success: true };
  } catch (error) {
    console.error("Delete failed:", error);
    throw new Error("Delete failed");
  }
}