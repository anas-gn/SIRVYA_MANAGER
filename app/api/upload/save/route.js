import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireManager } from "@/lib/requireManager";

export async function POST(req) {
  const { auth, response } = requireManager();
  if (!auth) return response;

  const { target, url, advisorId } = await req.json();

  if (!url) {
    return NextResponse.json({ error: "URL manquante." }, { status: 400 });
  }

  if (target === "avatar") {
    await query(`UPDATE users SET avatarUrl = ? WHERE id = ?`, [url, auth.id]);
    return NextResponse.json({ ok: true });
  }

  if (target === "advisorImage") {
    if (!advisorId) {
      return NextResponse.json({ error: "advisorId manquant." }, { status: 400 });
    }
    const owned = await query(
      `SELECT id FROM advisorprofiles WHERE userID = ? AND ville = ? LIMIT 1`,
      [advisorId, auth.ville]
    );
    if (owned.length === 0) {
      return NextResponse.json({ error: "Advisor introuvable dans votre ville." }, { status: 404 });
    }
    await query(`INSERT INTO imageadvisor (idAdvisor, UrlImage) VALUES (?, ?)`, [advisorId, url]);
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Cible inconnue." }, { status: 400 });
}
