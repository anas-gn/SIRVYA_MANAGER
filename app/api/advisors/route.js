import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireManager } from "@/lib/requireManager";

export async function GET(req) {
  const { auth, response } = requireManager();
  if (!auth) return response;

  const ville = auth.ville;
  const rows = await query(
    `SELECT
        u.id, u.firstName, u.lastName, u.email, u.avatarUrl, u.isApproved, u.createdAt,
        ap.id AS advisorProfileId, ap.specialty, ap.companyName, ap.bio, ap.ville, ap.location
     FROM advisorprofiles ap
     JOIN users u ON u.id = ap.userID
     WHERE ap.ville = ?
     ORDER BY u.createdAt DESC`,
    [ville]
  );

  return NextResponse.json({ advisors: rows });
}
