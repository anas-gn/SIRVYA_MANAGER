import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { verifyPassword, signToken, setAuthCookie } from "@/lib/auth";

export async function POST(req) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: "Email et mot de passe requis." }, { status: 400 });
    }

    const users = await query(
      "SELECT id, firstName, lastName, email, passwordHash, role FROM users WHERE email = ? LIMIT 1",
      [email]
    );
    if (users.length === 0) {
      return NextResponse.json({ error: "Identifiants incorrects." }, { status: 401 });
    }
    const user = users[0];

    if (user.role !== "manager") {
      return NextResponse.json(
        { error: "Ce compte n'est pas un compte manager." },
        { status: 403 }
      );
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "Identifiants incorrects." }, { status: 401 });
    }

    const profiles = await query("SELECT ville FROM managerprofiles WHERE userId = ? LIMIT 1", [
      user.id
    ]);
    const ville = profiles[0]?.ville || null;

    const token = signToken({ id: user.id, email: user.email, role: "manager", ville });
    setAuthCookie(token);

    return NextResponse.json({
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        ville
      }
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erreur serveur lors de la connexion." }, { status: 500 });
  }
}
