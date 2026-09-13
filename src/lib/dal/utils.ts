import "server-only";
import {headers} from "next/headers";
import {auth} from "@/lib/auth";

export async function getCurrentSession() {

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if(!session || !session.user )
    throw new Error("Unauthorized");

  return session;
}