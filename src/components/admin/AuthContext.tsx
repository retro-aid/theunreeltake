"use client";

import React, { createContext } from "react";
import { SessionData } from "@/lib/auth";

export const AuthContext = createContext({} as SessionData);

export function AuthContextProvider({
  children,
  session,
}: Readonly<{ children: React.ReactNode; session: SessionData }>) {
  return <AuthContext value={session}>{children}</AuthContext>;
}
