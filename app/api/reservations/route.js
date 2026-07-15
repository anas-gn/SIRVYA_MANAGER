import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireManager } from "@/lib/requireManager";

export async function GET(req) {
  const { auth, response } = requireManager();
  if (!auth) return response;

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  const ville = auth.ville;

  const conditions = [
    `(cp.ville = ? OR cp.advisorID IN (SELECT ap.userID FROM advisorprofiles ap WHERE ap.ville = ?))`
  ];
  const values = [ville, ville];

  if (status && ["pending", "confirmed", "cancelled"].includes(status)) {
    conditions.push("r.status = ?");
    values.push(status);
  }

  const rows = await query(
    `SELECT r.id, r.reservedDate, r.reservedTime, r.status, r.price, r.location, r.companyName,
            r.rejectionReason, r.cancellationReason, r.cancelledBy, r.createdAt,
            client.id AS clientId, client.firstName AS clientFirstName, client.lastName AS clientLastName,
            coach.id AS coachId, coach.firstName AS coachFirstName, coach.lastName AS coachLastName
     FROM reservations r
     JOIN users client ON client.id = r.clientID
     JOIN users coach ON coach.id = r.coachID
     JOIN coachprofiles cp ON cp.userID = coach.id
     WHERE ${conditions.join(" AND ")}
     ORDER BY r.reservedDate DESC, r.reservedTime DESC`,
    values
  );

  return NextResponse.json({ reservations: rows });
}
