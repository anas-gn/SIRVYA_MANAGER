import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { hashPassword, signToken, setAuthCookie } from "@/lib/auth";

export async function POST(req) {
  try {
    const body = await req.json();
    const { firstName, lastName, email, password, ville } = body;

    if (!firstName || !lastName || !email || !password || !ville) {
      return NextResponse.json(
        { error: "Tous les champs sont obligatoires (prenom, nom, email, mot de passe, ville)." },
        { status: 400 }
      );
    }
    if (password.length < 6) {
      return NextResponse.json(
        { error: "Le mot de passe doit contenir au moins 6 caracteres." },
        { status: 400 }
      );
    }

    const existing = await query("SELECT id FROM users WHERE email = ? LIMIT 1", [email]);
    if (existing.length > 0) {
      return NextResponse.json({ error: "Un compte existe deja avec cet email." }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);

    const insertUser = await query(
      `INSERT INTO users (firstName, lastName, email, passwordHash, role, gender, isPremium, isApproved)
       VALUES (?, ?, ?, ?, 'manager', 'Other', 0, 1)`,
      [firstName, lastName, email, passwordHash]
    );

    const userId = insertUser.insertId;

    await query(`INSERT INTO managerprofiles (userId, ville) VALUES (?, ?)`, [userId, ville]);

    const token = signToken({ id: userId, email, role: "manager", ville });
    setAuthCookie(token);

    return NextResponse.json({
      user: { id: userId, firstName, lastName, email, role: "manager", ville }
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erreur serveur lors de l'inscription." }, { status: 500 });
  }
}
