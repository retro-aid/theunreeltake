import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import dayjs from "dayjs";
import prisma from "@/lib/prisma";

const SEEN_COOKIE = "urt_seen";
const MAX_TRACKED = 40;

export async function POST(request: NextRequest) {
  try {
    const { slug } = await request.json();

    if (!slug || typeof slug !== "string") {
      return NextResponse.json({ counted: false }, { status: 400 });
    }

    const cookieStore = await cookies();
    const seen = cookieStore.get(SEEN_COOKIE)?.value.split(",").filter(Boolean) ?? [];

    if (seen.includes(slug)) {
      return NextResponse.json({ counted: false }, { status: 200 });
    }

    await prisma.post.update({
      where: { slug },
      data: { views: { increment: 1 } },
    });

    const updated = [...seen, slug].slice(-MAX_TRACKED);

    cookieStore.set({
      name: SEEN_COOKIE,
      value: updated.join(","),
      httpOnly: true,
      sameSite: "strict",
      priority: "low",
      expires: dayjs().add(1, "day").toDate(),
    });

    return NextResponse.json({ counted: true }, { status: 200 });
  } catch (error) {
    console.error("Failed to record post view:", error);
    return NextResponse.json({ counted: false }, { status: 500 });
  }
}