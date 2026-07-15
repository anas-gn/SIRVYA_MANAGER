"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Users,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  ChevronRight,
  Phone,
  Coins,
  Loader2,
  AlertCircle,
} from "lucide-react";

export default function CoachesPage() {
  const [coaches, setCoaches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/coaches");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur de chargement");
      setCoaches(data.coaches);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function toggleApproval(coach) {
    setBusyId(coach.id);
    try {
      await fetch(`/api/coaches/${coach.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isApproved: coach.isApproved ? 0 : 1 }),
      });
      await load();
    } finally {
      setBusyId(null);
    }
  }

  const filtered = coaches.filter((c) => {
    const matchesSearch =
      !search ||
      `${c.firstName} ${c.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      filterStatus === "all"
        ? true
        : filterStatus === "approved"
        ? c.isApproved
        : !c.isApproved;
    return matchesSearch && matchesStatus;
  });

  const approvedCount = coaches.filter((c) => c.isApproved).length;
  const pendingCount = coaches.filter((c) => !c.isApproved).length;

  return (
    <div className="space-y-6">
      {/* ─── Banner ─── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#5a1530] via-[#3a0e20] to-[#1a0a0a] p-6 sm:p-8 text-white shadow-xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 h-40 w-40 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute bottom-0 left-0 -mb-6 -ml-6 h-28 w-28 rounded-full bg-[#D1F96B]/10 blur-2xl" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[#c98b9a] text-sm font-medium mb-1">
              <Users className="h-4 w-4" />
              <span>Gestion des coachs</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Coaches
            </h1>
            <p className="mt-1 text-[#c98b9a] text-sm max-w-md">
              Coachs actifs dans votre ville. Approuvez ou suspendez les comptes.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-xl bg-white/10 backdrop-blur-sm px-4 py-2 border border-white/10">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <div>
                <p className="text-xs text-white/60">Approuvés</p>
                <p className="text-lg font-bold tabular-nums">{approvedCount}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-white/10 backdrop-blur-sm px-4 py-2 border border-white/10">
              <Clock className="h-4 w-4 text-amber-400" />
              <div>
                <p className="text-xs text-white/60">En attente</p>
                <p className="text-lg font-bold tabular-nums">{pendingCount}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Filters ─── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7a5a5a]" />
          <input
            type="text"
            placeholder="Rechercher un coach..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-white/[0.04] pl-10 pr-4 py-2.5 text-sm text-white placeholder-[#7a5a5a] outline-none transition-all focus:border-[#7a1e3a]/50 focus:bg-white/[0.07] focus:ring-2 focus:ring-[#7a1e3a]/10"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-[#7a5a5a]" />
          {[
            { key: "all", label: "Tous", count: coaches.length },
            { key: "approved", label: "Approuvés", count: approvedCount },
            { key: "pending", label: "En attente", count: pendingCount },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFilterStatus(f.key)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                filterStatus === f.key
                  ? "bg-gradient-to-r from-[#7a1e3a] to-[#5a1530] text-white shadow-sm border border-transparent"
                  : "bg-white/[0.03] text-[#9a7a7a] hover:bg-white/[0.06] hover:text-[#d0b0b0] border border-white/10"
              }`}
            >
              {f.label} <span className="opacity-70">({f.count})</span>
            </button>
          ))}
        </div>
      </div>

      {/* ─── Loading Skeleton ─── */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="rounded-2xl border border-white/5 bg-gradient-to-br from-white/[0.04] to-white/[0.01] p-6 animate-pulse"
            >
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-[14px] bg-white/5" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-24 rounded bg-white/5" />
                  <div className="h-3 w-16 rounded bg-white/5" />
                </div>
              </div>
              <div className="mt-5 space-y-2">
                <div className="h-3 w-full rounded bg-white/5" />
                <div className="h-3 w-2/3 rounded bg-white/5" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ─── Error ─── */}
      {error && !loading && (
        <div className="flex items-center gap-3 rounded-2xl border border-red-900/20 bg-red-900/8 px-5 py-4 text-sm text-red-300">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ─── Content ─── */}
      {!loading && !error && (
        <>
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/8 bg-white/[0.02] py-20 text-center">
              <Users className="h-14 w-14 text-white/10 mb-4" />
              <p className="text-[#9a7a7a] font-medium">
                {search || filterStatus !== "all"
                  ? "Aucun coach ne correspond à vos critères."
                  : "Aucun coach trouvé pour votre ville."}
              </p>
              <p className="text-[#7a5a5a] text-sm mt-1">
                {search || filterStatus !== "all"
                  ? "Essayez de modifier votre recherche ou vos filtres."
                  : "Les coachs apparaîtront ici une fois enregistrés."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((c, idx) => (
                <div
                  key={c.id}
                  className="group relative flex flex-col rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.06] to-white/[0.02] p-6 shadow-sm transition-all duration-400 hover:shadow-2xl hover:-translate-y-1 hover:border-[#7a1e3a]/25"
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  {/* Top highlight line */}
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3.5">
                      {c.avatarUrl ? (
                        <Image
                          src={c.avatarUrl}
                          alt={`${c.firstName} ${c.lastName}`}
                          width={48}
                          height={48}
                          className="rounded-[14px] object-cover ring-2 ring-white/10"
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-[14px] bg-gradient-to-br from-[#7a1e3a]/40 to-[#c98b9a]/30 flex items-center justify-center text-sm font-bold text-[#e8c8d0] ring-2 ring-white/10 shadow-lg shadow-[#7a1e3a]/10">
                          {c.firstName?.[0]}
                          {c.lastName?.[0]}
                        </div>
                      )}
                      <div className="min-w-0">
                        <Link
                          href={`/dashboard/coaches/${c.id}`}
                          className="text-[15px] font-semibold text-white hover:text-[#e8c8d0] transition-colors truncate block"
                        >
                          {c.firstName} {c.lastName}
                        </Link>
                        <p className="text-xs text-[#9a7a7a] truncate mt-0.5">
                          {c.email}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider backdrop-blur-sm border ${
                        c.isApproved
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          c.isApproved
                            ? "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.4)]"
                            : "bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.4)]"
                        }`}
                      />
                      {c.isApproved ? "Approuvé" : "En attente"}
                    </span>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2">
                    {c.tel && (
                      <span className="inline-flex items-center gap-1.5 rounded-xl bg-white/[0.04] px-3 py-1.5 text-[11px] text-[#b09090] border border-white/[0.08] hover:bg-white/[0.07] hover:border-white/[0.12] transition-all">
                        <Phone className="h-3 w-3 opacity-70" />
                        {c.tel}
                      </span>
                    )}
                    {c.price && (
                      <span className="inline-flex items-center gap-1.5 rounded-xl bg-[#7a1e3a]/10 px-3 py-1.5 text-[11px] text-[#e8a0b0] border border-[#7a1e3a]/20 hover:bg-[#7a1e3a]/15 hover:border-[#7a1e3a]/30 transition-all">
                        <Coins className="h-3 w-3 opacity-70" />
                        {c.price} DH
                      </span>
                    )}
                  </div>

                  {c.advisorFirstName && (
                    <p className="mt-3 text-xs text-[#7a5a5a]">
                      Advisor:{" "}
                      <span className="text-[#c98b9a] font-medium">
                        {c.advisorFirstName} {c.advisorLastName}
                      </span>
                    </p>
                  )}

                  <div className="mt-5 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />

                  <div className="mt-5 flex items-center justify-between">
                    <button
                      onClick={() => toggleApproval(c)}
                      disabled={busyId === c.id}
                      className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-medium transition-all ${
                        c.isApproved
                          ? "bg-amber-500/8 text-amber-400 hover:bg-amber-500/15 border border-amber-500/20 hover:border-amber-500/35 hover:shadow-[0_4px_16px_rgba(251,191,36,0.08)]"
                          : "bg-[#7a1e3a]/10 text-[#c98b9a] hover:bg-[#7a1e3a]/20 border border-[#7a1e3a]/20 hover:border-[#7a1e3a]/35 hover:shadow-[0_4px_16px_rgba(122,30,58,0.1)]"
                      } disabled:opacity-50 hover:-translate-y-0.5`}
                    >
                      {busyId === c.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : c.isApproved ? (
                        <Clock className="h-3.5 w-3.5" />
                      ) : (
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      )}
                      {c.isApproved ? "Suspendre" : "Approuver"}
                    </button>

                    <Link
                      href={`/dashboard/coaches/${c.id}`}
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-[#c98b9a] hover:text-[#e8c8d0] transition-all px-3 py-2 rounded-xl hover:bg-[#7a1e3a]/10"
                    >
                      Détails
                      <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </div>

                  {/* Bottom glow line on hover */}
                  <div className="absolute bottom-0 left-0 h-[2px] w-0 rounded-b-2xl bg-gradient-to-r from-[#7a1e3a] via-[#c98b9a] to-[#7a1e3a] transition-all duration-500 group-hover:w-full" />
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}