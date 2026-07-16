"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  User,
  Mail,
  Lock,
  MapPin,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  Check,
} from "lucide-react";

function FitlekLogo({ className = "h-10 w-auto" }) {
  return (
    <svg
      viewBox="0 0 132 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle cx="65.6104" cy="17.25" r="17.25" fill="#D1F96B" />
      <path
        d="M5.8103 21.85C19.2827 35.9 45.0007 47.25 64.4603 47.7336M125.41 21.85C112.388 36.0329 83.709 48.212 64.4603 47.7336M64.4603 47.7336V106.95C87.8436 95.8333 128.4 73.37 103.56 72.45C78.7203 71.53 36.477 72.0666 18.4603 72.45"
        stroke="currentColor"
        strokeWidth="16.1"
      />
    </svg>
  );
}

const PASSWORD_MIN = 6;

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    ville: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const passwordOk = form.password.length >= PASSWORD_MIN;

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur d'inscription");
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen w-full flex bg-[#1a0a0a]">
      {/* ─── Panneau visuel (masqué sur mobile) ─── */}
      <div
        className="hidden lg:flex lg:w-[42%] relative overflow-hidden"
        style={{
          backgroundImage:
            "linear-gradient(200deg, rgba(58,14,32,0.88) 0%, rgba(90,21,48,0.85) 45%, rgba(26,10,10,0.94) 100%), url('https://cdn.armut.com/images/services/103144-coach-sportif.jpeg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <svg className="absolute inset-0 w-full h-full opacity-[0.06] mix-blend-overlay pointer-events-none">
          <filter id="grain-register">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="100%" height="100%" filter="url(#grain-register)" />
        </svg>

        <svg
          viewBox="0 0 400 400"
          className="absolute -bottom-20 -left-24 w-[520px] h-[520px] opacity-40"
        >
          <circle
            cx="200"
            cy="200"
            r="160"
            fill="none"
            stroke="#D1F96B"
            strokeWidth="1"
            strokeDasharray="4 10"
            className="animate-[spin_60s_linear_infinite]"
            style={{ transformOrigin: "200px 200px" }}
          />
          <circle
            cx="200"
            cy="200"
            r="120"
            fill="none"
            stroke="#c98b9a"
            strokeWidth="1"
            strokeDasharray="2 8"
            className="animate-[spin_90s_linear_infinite_reverse]"
            style={{ transformOrigin: "200px 200px" }}
          />
        </svg>

        <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-[#D1F96B]/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-80 w-80 rounded-full bg-[#c98b9a]/10 blur-3xl" />

        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <div className="flex items-center gap-3 text-white">
                        <img src="/logo_dark.png" width="160" height="100" alt="Fitlek Logo" />
          </div>

          <div className="max-w-sm">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-sm px-3 py-1 text-xs font-medium text-[#D1F96B] mb-5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#D1F96B] animate-pulse" />
              Nouveau compte Manager
            </div>
            <h1 className="text-3xl font-bold text-white leading-tight tracking-tight">
              Prenez en main la croissance de votre ville.
            </h1>
            <p className="mt-4 text-sm text-[#e8c8d0] leading-relaxed">
              Un compte manager par ville : validez les advisors, suivez les coaches et pilotez les réservations en un seul endroit.
            </p>

            <ul className="mt-8 space-y-3">
              {[
                "Approbation des advisors en un clic",
                "Suivi des réservations en temps réel",
                "Statistiques de croissance par ville",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-[#f5e6d3]">
                  <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#D1F96B]/20">
                    <Check className="h-2.5 w-2.5 text-[#D1F96B]" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <p className="text-xs text-[#c98b9a]/70">
            © {new Date().getFullYear()} SIRVYA. Tous droits réservés.
          </p>
        </div>
      </div>

      {/* ─── Panneau formulaire ─── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="flex lg:hidden items-center gap-3 text-[#f5e6d3] mb-10 justify-center">
            <img src="/logo_dark.png" width="160" height="100" alt="SIRVYA Logo" />
           
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-[#f5e6d3] tracking-tight">
              Créer un compte Manager
            </h2>
            <p className="text-sm text-[#a08080] mt-2">
              Gérez les advisors, coaches et réservations de votre ville.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-[#a08080]">
                  Prénom
                </label>
                <div className="relative mt-2">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#a08080]" />
                  <input
                    required
                    placeholder="Sara"
                    className="w-full rounded-xl border border-[#3d1a1a] bg-[#2d1212] pl-10 pr-3 py-3 text-sm text-[#f5e6d3] placeholder:text-[#6b5555] outline-none transition-all focus:border-[#7a1e3a] focus:ring-2 focus:ring-[#7a1e3a]/30"
                    value={form.firstName}
                    onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-[#a08080]">
                  Nom
                </label>
                <div className="relative mt-2">
                  <input
                    required
                    placeholder="Benali"
                    className="w-full rounded-xl border border-[#3d1a1a] bg-[#2d1212] px-3 py-3 text-sm text-[#f5e6d3] placeholder:text-[#6b5555] outline-none transition-all focus:border-[#7a1e3a] focus:ring-2 focus:ring-[#7a1e3a]/30"
                    value={form.lastName}
                    onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-[#a08080]">
                Email
              </label>
              <div className="relative mt-2">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#a08080]" />
                <input
                  type="email"
                  required
                  placeholder="vous@fitlek.com"
                  className="w-full rounded-xl border border-[#3d1a1a] bg-[#2d1212] pl-10 pr-4 py-3 text-sm text-[#f5e6d3] placeholder:text-[#6b5555] outline-none transition-all focus:border-[#7a1e3a] focus:ring-2 focus:ring-[#7a1e3a]/30"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-[#a08080]">
                Ville gérée
              </label>
              <div className="relative mt-2">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#a08080]" />
                <input
                  required
                  placeholder="Ex: Casablanca"
                  className="w-full rounded-xl border border-[#3d1a1a] bg-[#2d1212] pl-10 pr-4 py-3 text-sm text-[#f5e6d3] placeholder:text-[#6b5555] outline-none transition-all focus:border-[#7a1e3a] focus:ring-2 focus:ring-[#7a1e3a]/30"
                  value={form.ville}
                  onChange={(e) => setForm({ ...form, ville: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-[#a08080]">
                Mot de passe
              </label>
              <div className="relative mt-2">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#a08080]" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={PASSWORD_MIN}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-[#3d1a1a] bg-[#2d1212] pl-10 pr-11 py-3 text-sm text-[#f5e6d3] placeholder:text-[#6b5555] outline-none transition-all focus:border-[#7a1e3a] focus:ring-2 focus:ring-[#7a1e3a]/30"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#a08080] hover:text-[#c98b9a] transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {form.password.length > 0 && (
                <p className={`mt-1.5 text-xs ${passwordOk ? "text-emerald-400" : "text-[#a08080]"}`}>
                  {passwordOk
                    ? "Longueur suffisante"
                    : `Encore ${PASSWORD_MIN - form.password.length} caractère${PASSWORD_MIN - form.password.length > 1 ? "s" : ""} minimum`}
                </p>
              )}
            </div>

            {error && (
              <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2.5 text-sm text-rose-400">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="group w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#7a1e3a] to-[#5a1530] px-4 py-3 text-sm font-semibold text-[#f5e6d3] shadow-lg shadow-[#7a1e3a]/20 transition-all hover:shadow-xl hover:shadow-[#7a1e3a]/30 hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Création...
                </>
              ) : (
                <>
                  Créer mon compte
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </button>
          </form>

          <p className="text-sm text-[#a08080] mt-8 text-center">
            Déjà un compte ?{" "}
            <Link href="/login" className="text-[#c98b9a] font-semibold hover:text-[#f5e6d3] transition-colors">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}