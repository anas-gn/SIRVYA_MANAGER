"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Star,
  Phone,
  Coins,
  MapPin,
  Calendar,
  Globe,
  FileCheck,
  Users,
  Award,
  TrendingUp,
  MessageSquare,
} from "lucide-react";

export default function CoachDetailPage() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  async function load() {
    try {
      const res = await fetch(`/api/coaches/${id}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Erreur de chargement");
      setData(json);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    load();
  }, [id]);

  if (error)
    return (
      <div className="rounded-2xl border border-red-900/20 bg-red-900/8 px-5 py-4 text-sm text-red-300">
        {error}
      </div>
    );

  if (!data)
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-32 rounded-2xl bg-white/[0.03] border border-white/[0.06]" />
        <div className="h-24 rounded-2xl bg-white/[0.03] border border-white/[0.06]" />
      </div>
    );

  const { coach, reviews } = data;
  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  return (
    <div className="space-y-5">
      {/* ─── Back link + ID ─── */}
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard/coaches"
          className="inline-flex items-center gap-1.5 text-sm text-[#9a7a7a] hover:text-[#e8c8d0] transition-colors"
        >
          <svg
            className="h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
          Coaches
        </Link>
        <span className="text-xs text-[#7a5a5a] font-mono">
          ID #{String(coach.id).padStart(4, "0")}
        </span>
      </div>

      {/* ─── Header Card ─── */}
      <div className="rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.06] to-white/[0.02] p-6 sm:p-7 backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="relative shrink-0">
              {coach.avatarUrl ? (
                <Image
                  src={coach.avatarUrl}
                  alt="avatar"
                  width={80}
                  height={80}
                  className="rounded-2xl object-cover ring-2 ring-white/10"
                />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#7a1e3a]/30 to-[#c98b9a]/20 flex items-center justify-center text-xl font-bold text-[#e8c8d0] ring-2 ring-white/10">
                  {coach.firstName?.[0]}
                  {coach.lastName?.[0]}
                </div>
              )}
              <span
                className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-[#1a0a0a] shadow-lg ${
                  coach.isApproved ? "bg-emerald-500 shadow-emerald-500/30" : "bg-amber-500 shadow-amber-500/30"
                }`}
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">
                {coach.firstName} {coach.lastName}
              </h1>
              <p className="text-sm text-[#9a7a7a] mt-0.5">{coach.email}</p>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium mt-2.5 backdrop-blur-sm border ${
                  coach.isApproved
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    coach.isApproved
                      ? "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.4)]"
                      : "bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.4)]"
                  }`}
                />
                {coach.isApproved ? "Approuvé" : "En attente"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-xl bg-[#7a1e3a]/10 px-4 py-2 border border-[#7a1e3a]/20">
              <Star className="h-4 w-4 text-[#c98b9a] fill-[#c98b9a]" />
              <div>
                <p className="text-xs text-[#7a5a5a]">Note</p>
                <p className="text-lg font-bold text-[#e8c8d0] tabular-nums">
                  {avgRating || "—"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-white/[0.04] px-4 py-2 border border-white/[0.08]">
              <MessageSquare className="h-4 w-4 text-[#9a7a7a]" />
              <div>
                <p className="text-xs text-[#7a5a5a]">Avis</p>
                <p className="text-lg font-bold text-white tabular-nums">
                  {reviews.length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Info Cards ─── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <InfoCard label="Téléphone" value={coach.tel || "—"} />
        <InfoCard label="Prix / séance" value={coach.price ? `${coach.price} DH` : "—"} />
        <InfoCard label="Ville" value={coach.ville || "—"} />
        <InfoCard label="Membre depuis" value={formatDate(coach.createdAt) || "—"} mono />
      </div>

      {/* ─── Bio ─── */}
      {coach.bio && (
        <div className="rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.06] to-white/[0.02] p-6 backdrop-blur-sm">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-[#7a5a5a]">
            Bio
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-[#c0a8a8]">
            {coach.bio}
          </p>
        </div>
      )}

      {/* ─── Instagram & Certificate ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {coach.instagramPage && (
          <div className="rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.06] to-white/[0.02] p-6 backdrop-blur-sm">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-[#7a5a5a] mb-3">
              Instagram
            </h2>
            <a
              href={coach.instagramPage}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium text-[#c98b9a] hover:text-[#e8c8d0] transition-colors"
            >
              <svg
                className="h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
              </svg>
              {coach.instagramPage.replace(
                /^https?:\/\/(www\.)?instagram\.com\//,
                "@"
              )}
            </a>
          </div>
        )}

        {coach.certificateUrl && (
          <div className="rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.06] to-white/[0.02] p-6 backdrop-blur-sm">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-[#7a5a5a] mb-3">
              Certificat
            </h2>
            <a
              href={coach.certificateUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium text-[#c98b9a] hover:text-[#e8c8d0] transition-colors"
            >
              <FileCheck className="h-5 w-5" />
              Voir le certificat
            </a>
          </div>
        )}
      </div>

      {/* ─── Performance ─── */}
      <div className="rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.06] to-white/[0.02] p-6 backdrop-blur-sm">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-[#7a5a5a] mb-4">
          Performance
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-[#e8c8d0]">
              {coach.totalInvitations || 0}
            </p>
            <p className="text-xs text-[#7a5a5a] mt-0.5">Invitations totales</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-[#e8c8d0]">
              {coach.earnedPoints || 0}
            </p>
            <p className="text-xs text-[#7a5a5a] mt-0.5">Points gagnés</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-[#e8c8d0]">
              {reviews.length}
            </p>
            <p className="text-xs text-[#7a5a5a] mt-0.5">Avis reçus</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-[#e8c8d0]">
              {avgRating ? `${avgRating}/5` : "—"}
            </p>
            <p className="text-xs text-[#7a5a5a] mt-0.5">Note moyenne</p>
          </div>
        </div>
      </div>

      {/* ─── Reviews ─── */}
      <div className="rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.06] to-white/[0.02] p-6 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-white">Avis clients</h2>
          {avgRating && (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#7a1e3a]/10 px-3 py-1 text-xs font-medium text-[#c98b9a] border border-[#7a1e3a]/20">
              <Star className="h-3 w-3 fill-[#c98b9a]" />
              {avgRating} / 5
            </span>
          )}
        </div>

        <div className="space-y-3">
          {reviews.map((r) => (
            <div
              key={r.id}
              className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4 hover:bg-white/[0.05] transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#7a1e3a]/30 to-[#c98b9a]/20 flex items-center justify-center text-xs font-semibold text-[#e8c8d0] ring-1 ring-white/[0.08]">
                    {r.firstName?.[0]}
                    {r.lastName?.[0]}
                  </div>
                  <p className="text-sm font-medium text-white">
                    {r.firstName} {r.lastName}
                  </p>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-[#7a1e3a]/10 px-2 py-0.5 text-xs font-medium text-[#c98b9a] border border-[#7a1e3a]/15">
                  <Star className="h-3 w-3 fill-[#c98b9a]" />
                  {r.rating}
                </span>
              </div>
              {r.comment && (
                <p className="text-sm text-[#9a7a7a] mt-2">{r.comment}</p>
              )}
              <p className="text-[11px] text-[#7a5a5a] mt-2">
                {formatDate(r.createdAt)}
              </p>
            </div>
          ))}
          {reviews.length === 0 && (
            <p className="text-sm text-[#7a5a5a] py-4 text-center">
              Aucun avis pour le moment.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoCard({ label, value, mono }) {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.06] to-white/[0.02] px-4 py-3.5 backdrop-blur-sm hover:border-white/[0.12] transition-colors">
      <p className="text-[11px] uppercase tracking-wide text-[#7a5a5a] font-medium">
        {label}
      </p>
      <p
        className={`mt-1 text-white truncate ${
          mono ? "font-mono text-xs" : "text-sm font-medium"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function formatDate(dateStr) {
  if (!dateStr) return null;
  try {
    return new Date(dateStr).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}