import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireManager } from "@/lib/requireManager";

export async function GET(req, { params }) {
  const { auth, response } = requireManager();
  if (!auth) return response;

  const { id } = params;

  const rows = await query(
    `SELECT u.id, u.firstName, u.lastName, u.email, u.avatarUrl, u.isApproved, u.createdAt,
            cp.id AS coachProfileId, cp.bio, cp.instagramPage, cp.certificateUrl, cp.tel, cp.price, cp.ville,
            cp.totalInvitations, cp.earnedPoints
     FROM coachprofiles cp
     JOIN users u ON u.id = cp.userID
     WHERE u.id = ?
       AND (cp.ville = ? OR cp.advisorID IN (SELECT ap.userID FROM advisorprofiles ap WHERE ap.ville = ?))
     LIMIT 1`,
    [id, auth.ville, auth.ville]
  );

  if (rows.length === 0) {
    return NextResponse.json({ error: "Coach introuvable." }, { status: 404 });
  }

  const reviews = await query(
    `SELECT cr.id, cr.rating, cr.comment, cr.createdAt, u.firstName, u.lastName
     FROM coachreviews cr JOIN users u ON u.id = cr.clientID
     WHERE cr.coachID = ? ORDER BY cr.createdAt DESC LIMIT 20`,
    [id]
  );

  return NextResponse.json({ coach: rows[0], reviews });
}

export async function PATCH(req, { params }) {
  const { auth, response } = requireManager();
  if (!auth) return response;

  const { id } = params;
  const body = await req.json();
  const { isApproved, bio, tel, price } = body;

  const owned = await query(
    `SELECT cp.id FROM coachprofiles cp
     WHERE cp.userID = ?
       AND (cp.ville = ? OR cp.advisorID IN (SELECT ap.userID FROM advisorprofiles ap WHERE ap.ville = ?))
     LIMIT 1`,
    [id, auth.ville, auth.ville]
  );
  if (owned.length === 0) {
    return NextResponse.json({ error: "Coach introuvable dans votre ville." }, { status: 404 });
  }

  if (typeof isApproved === "number" || typeof isApproved === "boolean") {
    await query(`UPDATE users SET isApproved = ? WHERE id = ?`, [isApproved ? 1 : 0, id]);
  }

  const fields = [];
  const values = [];
  if (bio !== undefined) { fields.push("bio = ?"); values.push(bio); }
  if (tel !== undefined) { fields.push("tel = ?"); values.push(tel); }
  if (price !== undefined) { fields.push("price = ?"); values.push(price); }

  if (fields.length > 0) {
    values.push(id);
    await query(`UPDATE coachprofiles SET ${fields.join(", ")} WHERE userID = ?`, values);
  }

  return NextResponse.json({ ok: true });
}
