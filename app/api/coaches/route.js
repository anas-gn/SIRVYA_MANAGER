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
        cp.id AS coachProfileId, cp.bio, cp.instagramPage,cp.certificateUrl,cp.invitationCode, cp.tel, cp.price, cp.ville,
        cp.totalInvitations, cp.earnedPoints,
        adv.firstName AS advisorFirstName, adv.lastName AS advisorLastName
     FROM coachprofiles cp
     JOIN users u ON u.id = cp.userID
     LEFT JOIN users adv ON adv.id = cp.advisorID
     WHERE cp.ville = ?
        OR cp.advisorID IN (SELECT ap.userID FROM advisorprofiles ap WHERE ap.ville = ?)
     ORDER BY u.createdAt DESC`,
    [ville, ville]
  );

  return NextResponse.json({ coaches: rows });
}
