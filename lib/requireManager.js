import { NextResponse } from "next/server";
import { getAuthFromCookies } from "@/lib/auth";

export function requireManager() {
  const auth = getAuthFromCookies();
  if (!auth || auth.role !== "manager") {
    return {
      auth: null,
      response: NextResponse.json({ error: "Non authentifie." }, { status: 401 })
    };
  }
  return { auth, response: null };
}
