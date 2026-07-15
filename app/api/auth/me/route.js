import { NextResponse } from "next/server";
import { getAuthFromCookies } from "@/lib/auth";
import { query } from "@/lib/db";

export async function GET() {
  const auth = getAuthFromCookies();
  if (!auth) {
    return NextResponse.json({ user: null }, { status: 401 });
  }
  const rows = await query(
    `SELECT u.id, u.firstName, u.lastName, u.email, u.avatarUrl, mp.ville
     FROM users u
     JOIN managerprofiles mp ON mp.userId = u.id
     WHERE u.id = ? LIMIT 1`,
    [auth.id]
  );
  if (rows.length === 0) {
    return NextResponse.json({ user: null }, { status: 404 });
  }
  return NextResponse.json({ user: rows[0] });
}
