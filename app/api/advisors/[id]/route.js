import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireManager } from "@/lib/requireManager";

export async function GET(req, { params }) {
  const { auth, response } = requireManager();
  if (!auth) return response;

  const { id } = params;

  const advisorRows = await query(
    `SELECT u.id, u.firstName, u.lastName, u.email, u.avatarUrl, u.isApproved, u.createdAt,
            ap.id AS advisorProfileId, ap.specialty, ap.companyName, ap.bio, ap.ville, ap.location
     FROM advisorprofiles ap
     JOIN users u ON u.id = ap.userID
     WHERE u.id = ? AND ap.ville = ?
     LIMIT 1`,
    [id, auth.ville]
  );

  if (advisorRows.length === 0) {
    return NextResponse.json({ error: "Advisor introuvable." }, { status: 404 });
  }

  const images = await query(
    `SELECT id, UrlImage FROM imageadvisor WHERE idAdvisor = ?`,
    [id]
  );

  const coaches = await query(
    `SELECT u.id, u.firstName, u.lastName, u.email, u.avatarUrl, u.isApproved,
            cp.bio, cp.tel, cp.price, cp.ville
     FROM coachprofiles cp
     JOIN users u ON u.id = cp.userID
     WHERE cp.advisorID = ?`,
    [id]
  );

  return NextResponse.json({ advisor: advisorRows[0], images, coaches });
}

export async function PATCH(req, { params }) {
  const { auth, response } = requireManager();
  if (!auth) return response;

  const { id } = params;
  const body = await req.json();
  const { isApproved, specialty, bio, companyName, location } = body;

  const owned = await query(
    `SELECT ap.id FROM advisorprofiles ap WHERE ap.userID = ? AND ap.ville = ? LIMIT 1`,
    [id, auth.ville]
  );
  if (owned.length === 0) {
    return NextResponse.json({ error: "Advisor introuvable dans votre ville." }, { status: 404 });
  }

  if (typeof isApproved === "number" || typeof isApproved === "boolean") {
    await query(`UPDATE users SET isApproved = ? WHERE id = ?`, [isApproved ? 1 : 0, id]);
  }

  const fields = [];
  const values = [];
  if (specialty !== undefined) { fields.push("specialty = ?"); values.push(specialty); }
  if (bio !== undefined) { fields.push("bio = ?"); values.push(bio); }
  if (companyName !== undefined) { fields.push("companyName = ?"); values.push(companyName); }
  if (location !== undefined) { fields.push("location = ?"); values.push(location); }

  if (fields.length > 0) {
    values.push(id);
    await query(`UPDATE advisorprofiles SET ${fields.join(", ")} WHERE userID = ?`, values);
  }

  return NextResponse.json({ ok: true });
}
