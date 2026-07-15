"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import CloudinaryUploader from "@/components/CloudinaryUploader";

export default function AdvisorDetailPage() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function load() {
    try {
      const res = await fetch(`/api/advisors/${id}`);
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

  async function toggleApproval() {
    if (!data) return;
    setSaving(true);
    try {
      const next = data.advisor.isApproved ? 0 : 1;
      const res = await fetch(`/api/advisors/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isApproved: next }),
      });
      if (!res.ok) throw new Error("Echec de la mise a jour");
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      {/* ─── Back link + ID ─── */}
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard/advisors"
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
          Advisors
        </Link>
        {data && (
          <span className="text-xs text-[#7a5a5a] font-mono">
            ID #{String(data.advisor.id).padStart(4, "0")}
          </span>
        )}
      </div>

      {/* ─── Error ─── */}
      {error && (
        <div className="mt-4 rounded-2xl border border-red-900/20 bg-red-900/8 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {/* ─── Loading Skeleton ─── */}
      {!data && !error && (
        <div className="mt-6 space-y-4 animate-pulse">
          <div className="h-32 rounded-2xl bg-white/[0.03] border border-white/[0.06]" />
          <div className="h-24 rounded-2xl bg-white/[0.03] border border-white/[0.06]" />
        </div>
      )}

      {/* ─── Content ─── */}
      {data && (() => {
        const { advisor, images, coaches } = data;
        return (
          <>
            {/* ─── Header Card ─── */}
            <div className="rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.06] to-white/[0.02] p-6 sm:p-7 backdrop-blur-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                  <div className="relative shrink-0">
                    {advisor.avatarUrl ? (
                      <Image
                        src={advisor.avatarUrl}
                        alt="avatar"
                        width={80}
                        height={80}
                        className="w-20 h-20 rounded-2xl object-cover ring-2 ring-white/10"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#7a1e3a]/30 to-[#c98b9a]/20 ring-2 ring-white/10 flex items-center justify-center overflow-hidden">
                        <svg
                          width="48"
                          height="48"
                          viewBox="0 0 132 120"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <circle cx="65.6104" cy="17.25" r="17.25" fill="#7a1e3a" />
                          <path
                            d="M5.8103 21.85C19.2827 35.9 45.0007 47.25 64.4603 47.7336M125.41 21.85C112.388 36.0329 83.709 48.212 64.4603 47.7336M64.4603 47.7336V106.95C87.8436 95.8333 128.4 73.37 103.56 72.45C78.7203 71.53 36.477 72.0666 18.4603 72.45"
                            stroke="#7a1e3a"
                            strokeWidth="16.1"
                          />
                        </svg>
                      </div>
                    )}
                    <span
                      className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-[#1a0a0a] shadow-lg ${
                        advisor.isApproved ? "bg-emerald-500 shadow-emerald-500/30" : "bg-amber-500 shadow-amber-500/30"
                      }`}
                    />
                  </div>

                  <div>
                    <h1 className="text-2xl font-bold tracking-tight text-white">
                      {advisor.firstName} {advisor.lastName}
                    </h1>
                    <p className="text-sm text-[#9a7a7a] mt-0.5">
                      {advisor.companyName || "Sans etablissement"}
                    </p>
                    <p className="text-xs text-[#7a5a5a] mt-1 font-mono">
                      {advisor.email}
                    </p>
                    <div className="mt-2.5 flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium backdrop-blur-sm border ${
                          advisor.isApproved
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            advisor.isApproved
                              ? "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.4)]"
                              : "bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.4)]"
                          }`}
                        />
                        {advisor.isApproved ? "Approuvé" : "En attente"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={toggleApproval}
                    disabled={saving}
                    role="switch"
                    aria-checked={!!advisor.isApproved}
                    className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors disabled:opacity-50 ${
                      advisor.isApproved ? "bg-[#7a1e3a]" : "bg-white/10"
                    }`}
                  >
                    <span
                      className={`inline-block h-[22px] w-[22px] transform rounded-full bg-white shadow transition-transform ${
                        advisor.isApproved
                          ? "translate-x-[24px]"
                          : "translate-x-[3px]"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* ─── Info Cards ─── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <InfoCard label="Specialite" value={advisor.specialty} />
              <InfoCard label="Ville" value={advisor.ville} />
              <InfoCard label="Localisation" value={advisor.location} />
              <InfoCard
                label="Membre depuis"
                value={formatDate(advisor.createdAt)}
                mono
              />
            </div>

            {/* ─── Bio ─── */}
            {advisor.bio && (
              <div className="rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.06] to-white/[0.02] p-6 backdrop-blur-sm">
                <h2 className="text-xs font-semibold uppercase tracking-wide text-[#7a5a5a]">
                  Bio
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-[#c0a8a8]">
                  {advisor.bio}
                </p>
              </div>
            )}

            {/* ─── Map ─── */}
            {advisor.location && (
              <div className="rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.06] to-white/[0.02] p-6 backdrop-blur-sm">
                <h2 className="text-xs font-semibold uppercase tracking-wide text-[#7a5a5a] mb-4">
                  Localisation sur la carte
                </h2>
                <div className="relative w-full h-64 sm:h-80 rounded-xl overflow-hidden ring-1 ring-white/[0.08]">
                  <iframe
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    loading="lazy"
                    allowFullScreen
                    referrerPolicy="no-referrer-when-downgrade"
                    src={`https://www.google.com/maps?q=${encodeURIComponent(
                      advisor.location
                    )}&output=embed`}
                  />
                </div>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    advisor.location
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 mt-3 text-xs font-medium text-[#c98b9a] hover:text-[#e8c8d0] transition-colors"
                >
                  <svg
                    className="h-3.5 w-3.5"
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
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" x2="21" y1="14" y2="3" />
                  </svg>
                  Ouvrir dans Google Maps
                </a>
              </div>
            )}

            {/* ─── Photos ─── */}
            <div className="rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.06] to-white/[0.02] p-6 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-white">
                  Photos de la salle
                </h2>
                <CloudinaryUploader
                  folder="fitlek/advisor-rooms"
                  target="advisorImage"
                  advisorId={advisor.id}
                  label="Ajouter une photo"
                  onUploaded={load}
                />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                {images.map((img) => (
                  <div
                    key={img.id}
                    className="group relative aspect-square rounded-xl overflow-hidden bg-white/[0.03] ring-1 ring-white/[0.08]"
                  >
                    <Image
                      src={img.UrlImage}
                      alt="salle"
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                ))}
                {images.length === 0 && (
                  <div className="col-span-full flex items-center justify-center rounded-xl border border-dashed border-white/[0.08] py-8 text-sm text-[#7a5a5a]">
                    Aucune photo pour le moment
                  </div>
                )}
              </div>
            </div>

            {/* ─── Coaches ─── */}
            <div className="rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.06] to-white/[0.02] p-6 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-white">
                  Coaches rattaches
                </h2>
                <span className="text-xs text-[#7a5a5a] font-mono">
                  {coaches.length}
                </span>
              </div>
              <div className="mt-3 -mx-2">
                {coaches.map((c) => (
                  <Link
                    key={c.id}
                    href={`/dashboard/coaches/${c.id}`}
                    className="flex items-center justify-between gap-4 rounded-xl px-2 py-2.5 hover:bg-white/[0.04] transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 shrink-0 rounded-full bg-gradient-to-br from-[#7a1e3a]/30 to-[#c98b9a]/20 flex items-center justify-center text-xs font-semibold text-[#e8c8d0] ring-1 ring-white/[0.08]">
                        {c.firstName?.[0]}
                        {c.lastName?.[0]}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                          {c.firstName} {c.lastName}
                        </p>
                        <p className="text-xs text-[#7a5a5a] truncate">
                          {c.tel || c.email}
                          {c.price ? ` · ${c.price} DH` : ""}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`shrink-0 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium backdrop-blur-sm border ${
                        c.isApproved
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          c.isApproved
                            ? "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.4)]"
                            : "bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.4)]"
                        }`}
                      />
                      {c.isApproved ? "Approuvé" : "En attente"}
                    </span>
                  </Link>
                ))}
                {coaches.length === 0 && (
                  <p className="text-sm text-[#7a5a5a] px-2 py-4">
                    Aucun coach rattache.
                  </p>
                )}
              </div>
            </div>
          </>
        );
      })()}
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
        {value || "—"}
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