import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export const config = {
  matcher: ["/dashboard/:path*", "/", "/landing"],
};

export async function proxy(request: NextRequest) {
  if (
    request.nextUrl.pathname === "/" ||
    request.nextUrl.pathname === "/landing"
  )
    return handleLandingProxy(request);

  return handleDashboardProxy(request);
}

function handleLandingProxy(request: NextRequest) {
  const hasTriviaCookie = request.cookies.has("unreel");

  if (request.nextUrl.pathname === "/" && !hasTriviaCookie)
    return NextResponse.redirect(new URL("/landing", request.url));

  if (request.nextUrl.pathname === "/landing" && hasTriviaCookie)
    return NextResponse.redirect(new URL("/", request.url));
}

function handleDashboardProxy(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);

  if (!sessionCookie) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}
