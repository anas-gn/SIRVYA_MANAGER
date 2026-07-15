import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireManager } from "@/lib/requireManager";

export async function PATCH(req, { params }) {
  const { auth, response } = requireManager();
  if (!auth) return response;

  const { id } = params;
  const body = await req.json();
  const { status, cancellationReason } = body;

  if (!["pending", "confirmed", "cancelled"].includes(status)) {
    return NextResponse.json({ error: "Statut invalide." }, { status: 400 });
  }

  const owned = await query(
    `SELECT r.id FROM reservations r
     JOIN coachprofiles cp ON cp.userID = r.coachID
     WHERE r.id = ?
       AND (cp.ville = ? OR cp.advisorID IN (SELECT ap.userID FROM advisorprofiles ap WHERE ap.ville = ?))
     LIMIT 1`,
    [id, auth.ville, auth.ville]
  );
  if (owned.length === 0) {
    return NextResponse.json({ error: "Reservation introuvable." }, { status: 404 });
  }

  if (status === "cancelled") {
    await query(
      `UPDATE reservations SET status = ?, cancellationReason = ?, cancelledBy = 'manager' WHERE id = ?`,
      [status, cancellationReason || "Annulee par le manager", id]
    );
  } else {
    await query(`UPDATE reservations SET status = ? WHERE id = ?`, [status, id]);
  }

  return NextResponse.json({ ok: true });
}
