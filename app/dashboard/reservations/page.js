"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  CalendarDays,
  Clock,
  Filter,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  MapPin,
  User,
  Coins,
  ChevronRight,
} from "lucide-react";

const STATUS_LABELS = {
  pending: "En attente",
  confirmed: "Confirmée",
  cancelled: "Annulée",
};

const STATUS_COLORS = {
  pending: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  confirmed: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  cancelled: "bg-red-500/10 text-red-400 border-red-500/20",
};

const STATUS_DOT = {
  pending: "bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.4)]",
  confirmed: "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.4)]",
  cancelled: "bg-red-400 shadow-[0_0_6px_rgba(248,113,113,0.4)]",
};

const STATUS_ICONS = {
  pending: Clock,
  confirmed: CheckCircle2,
  cancelled: XCircle,
};

export default function ReservationsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const statusFilter = searchParams.get("status") || "";

  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);

  async function load() {
    setLoading(true);
    try {
      const qs = statusFilter ? `?status=${statusFilter}` : "";
      const res = await fetch(`/api/reservations${qs}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur de chargement");
      setReservations(data.reservations);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [statusFilter]);

  function setFilter(value) {
    router.push(
      value
        ? `/dashboard/reservations?status=${value}`
        : "/dashboard/reservations"
    );
  }

  async function updateStatus(id, status) {
    setBusyId(id);
    try {
      await fetch(`/api/reservations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      await load();
    } finally {
      setBusyId(null);
    }
  }

  const counts = {
    all: reservations.length,
    pending: reservations.filter((r) => r.status === "pending").length,
    confirmed: reservations.filter((r) => r.status === "confirmed").length,
    cancelled: reservations.filter((r) => r.status === "cancelled").length,
  };

  return (
    <div className="space-y-6">
      {/* ─── Banner ─── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#5a1530] via-[#3a0e20] to-[#1a0a0a] p-6 sm:p-8 text-white shadow-xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 h-40 w-40 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute bottom-0 left-0 -mb-6 -ml-6 h-28 w-28 rounded-full bg-[#D1F96B]/10 blur-2xl" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[#c98b9a] text-sm font-medium mb-1">
              <CalendarDays className="h-4 w-4" />
              <span>Gestion des réservations</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Réservations
            </h1>
            <p className="mt-1 text-[#c98b9a] text-sm max-w-md">
              Suivez et gérez les réservations des clients auprès des coaches de
              votre ville.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-xl bg-white/10 backdrop-blur-sm px-4 py-2 border border-white/10">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <div>
                <p className="text-xs text-white/60">Confirmées</p>
                <p className="text-lg font-bold tabular-nums">
                  {counts.confirmed}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-white/10 backdrop-blur-sm px-4 py-2 border border-white/10">
              <Clock className="h-4 w-4 text-amber-400" />
              <div>
                <p className="text-xs text-white/60">En attente</p>
                <p className="text-lg font-bold tabular-nums">
                  {counts.pending}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Filters ─── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-[#7a5a5a]" />
          {[
            { key: "", label: "Toutes", count: counts.all },
            { key: "pending", label: "En attente", count: counts.pending },
            { key: "confirmed", label: "Confirmées", count: counts.confirmed },
            { key: "cancelled", label: "Annulées", count: counts.cancelled },
          ].map((f) => (
            <button
              key={f.key || "all"}
              onClick={() => setFilter(f.key)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                statusFilter === f.key
                  ? "bg-gradient-to-r from-[#7a1e3a] to-[#5a1530] text-white shadow-sm border border-transparent"
                  : "bg-white/[0.03] text-[#9a7a7a] hover:bg-white/[0.06] hover:text-[#d0b0b0] border border-white/10"
              }`}
            >
              {f.label}{" "}
              <span className="opacity-70">({f.count})</span>
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
              <div className="flex items-center justify-between">
                <div className="h-4 w-24 rounded bg-white/5" />
                <div className="h-6 w-20 rounded bg-white/5" />
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
          {reservations.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/8 bg-white/[0.02] py-20 text-center">
              <CalendarDays className="h-14 w-14 text-white/10 mb-4" />
              <p className="text-[#9a7a7a] font-medium">
                Aucune réservation trouvée.
              </p>
              <p className="text-[#7a5a5a] text-sm mt-1">
                Les réservations apparaîtront ici une fois créées.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {reservations.map((r) => {
                const StatusIcon = STATUS_ICONS[r.status];
                return (
                  <div
                    key={r.id}
                    className="group relative flex flex-col rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.06] to-white/[0.02] p-6 shadow-sm transition-all duration-400 hover:shadow-2xl hover:-translate-y-1 hover:border-[#7a1e3a]/25"
                  >
                    {/* Top highlight line */}
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-10 w-10 rounded-xl bg-[#7a1e3a]/10 flex items-center justify-center border border-[#7a1e3a]/15">
                          <CalendarDays className="h-5 w-5 text-[#c98b9a]" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">
                            {r.reservedDate}
                          </p>
                          <p className="text-xs text-[#9a7a7a]">
                            {r.reservedTime}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider backdrop-blur-sm border ${STATUS_COLORS[r.status]}`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[r.status]}`}
                        />
                        {STATUS_LABELS[r.status]}
                      </span>
                    </div>

                    <div className="mt-5 space-y-2.5">
                      <div className="flex items-center gap-2 text-sm">
                        <User className="h-3.5 w-3.5 text-[#7a5a5a]" />
                        <span className="text-[#9a7a7a]">Client:</span>
                        <span className="font-medium text-white">
                          {r.clientFirstName} {r.clientLastName}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <User className="h-3.5 w-3.5 text-[#7a5a5a]" />
                        <span className="text-[#9a7a7a]">Coach:</span>
                        <span className="font-medium text-white">
                          {r.coachFirstName} {r.coachLastName}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-3.5 w-3.5 text-[#7a5a5a]" />
                        <span className="text-[#9a7a7a]">Lieu:</span>
                        <span className="font-medium text-white">
                          {r.location || r.companyName || "—"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Coins className="h-3.5 w-3.5 text-[#7a5a5a]" />
                        <span className="text-[#9a7a7a]">Prix:</span>
                        <span className="font-medium text-white">
                          {Number(r.price) ? `${r.price} MAD` : "—"}
                        </span>
                      </div>
                    </div>

                    <div className="mt-5 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />

                    <div className="mt-5 flex items-center gap-2">
                      {r.status !== "confirmed" && (
                        <button
                          disabled={busyId === r.id}
                          onClick={() => updateStatus(r.id, "confirmed")}
                          className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-medium transition-all bg-emerald-500/8 text-emerald-400 hover:bg-emerald-500/15 border border-emerald-500/20 hover:border-emerald-500/35 hover:shadow-[0_4px_16px_rgba(52,211,153,0.08)] disabled:opacity-50"
                        >
                          {busyId === r.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <CheckCircle2 className="h-3.5 w-3.5" />
                          )}
                          Confirmer
                        </button>
                      )}
                      {r.status !== "cancelled" && (
                        <button
                          disabled={busyId === r.id}
                          onClick={() => updateStatus(r.id, "cancelled")}
                          className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-medium transition-all bg-red-500/8 text-red-400 hover:bg-red-500/15 border border-red-500/20 hover:border-red-500/35 hover:shadow-[0_4px_16px_rgba(248,113,113,0.08)] disabled:opacity-50"
                        >
                          {busyId === r.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <XCircle className="h-3.5 w-3.5" />
                          )}
                          Annuler
                        </button>
                      )}
                    </div>

                    {/* Bottom glow line on hover */}
                    <div className="absolute bottom-0 left-0 h-[2px] w-0 rounded-b-2xl bg-gradient-to-r from-[#7a1e3a] via-[#c98b9a] to-[#7a1e3a] transition-all duration-500 group-hover:w-full" />
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}