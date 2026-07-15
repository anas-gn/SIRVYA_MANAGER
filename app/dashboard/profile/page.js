"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import CloudinaryUploader from "@/components/CloudinaryUploader";
import {
  User,
  Mail,
  MapPin,
  Calendar,
  Camera,
  Shield,
  AlertCircle,
} from "lucide-react";

export default function ProfilePage() {
  const [me, setMe] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur de chargement");
      setMe(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-32 rounded-2xl bg-white/[0.03] border border-white/[0.06]" />
        <div className="h-48 rounded-2xl bg-white/[0.03] border border-white/[0.06]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-red-900/20 bg-red-900/8 px-5 py-4 text-sm text-red-300">
        <AlertCircle className="h-5 w-5 shrink-0" />
        <span>{error}</span>
      </div>
    );
  }

  if (!me) return null;

  return (
    <div className="space-y-6">
      {/* ─── Banner ─── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#5a1530] via-[#3a0e20] to-[#1a0a0a] p-6 sm:p-8 text-white shadow-xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 h-40 w-40 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute bottom-0 left-0 -mb-6 -ml-6 h-28 w-28 rounded-full bg-[#D1F96B]/10 blur-2xl" />

        <div className="relative z-10">
          <div className="flex items-center gap-2 text-[#c98b9a] text-sm font-medium mb-1">
            <Shield className="h-4 w-4" />
            <span>Mon compte</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Mon profil
          </h1>
          <p className="mt-1 text-[#c98b9a] text-sm max-w-md">
            Gérez vos informations personnelles et votre photo de profil.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* ─── Avatar Card ─── */}
        <div className="lg:col-span-1">
          <div className="rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.06] to-white/[0.02] p-6 text-center backdrop-blur-sm">
            <div className="relative mx-auto w-28 h-28">
              {me.avatarUrl ? (
                <Image
                  src={me.avatarUrl}
                  alt="avatar"
                  fill
                  className="rounded-2xl object-cover ring-2 ring-white/10"
                />
              ) : (
                <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-[#7a1e3a]/30 to-[#c98b9a]/20 flex items-center justify-center text-3xl font-bold text-[#e8c8d0] ring-2 ring-white/10">
                  {me.firstName?.[0]}
                  {me.lastName?.[0]}
                </div>
              )}
              <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-[#7a1e3a] flex items-center justify-center ring-2 ring-[#1a0a0a] shadow-lg shadow-[#7a1e3a]/30">
                <Camera className="h-4 w-4 text-white" />
              </div>
            </div>

            <h2 className="mt-4 text-lg font-semibold text-white">
              {me.firstName} {me.lastName}
            </h2>
            <p className="text-sm text-[#9a7a7a]">{me.email}</p>

            <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[#7a1e3a]/10 px-3 py-1 text-xs font-medium text-[#c98b9a] border border-[#7a1e3a]/20">
              <MapPin className="h-3 w-3" />
              {me.ville}
            </div>

            <div className="mt-6 pt-4 border-t border-white/[0.08]">
              <CloudinaryUploader
                folder="fitlek/avatars"
                target="avatar"
                label="Changer ma photo"
                onUploaded={load}
              />
            </div>
          </div>
        </div>

        {/* ─── Info Cards ─── */}
        <div className="lg:col-span-2 space-y-5">
          <div className="rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.06] to-white/[0.02] p-6 backdrop-blur-sm">
            <h2 className="text-sm font-semibold text-white mb-4">
              Informations personnelles
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoField icon={<User className="h-3.5 w-3.5" />} label="Prénom" value={me.firstName} />
              <InfoField icon={<User className="h-3.5 w-3.5" />} label="Nom" value={me.lastName} />
              <InfoField icon={<Mail className="h-3.5 w-3.5" />} label="Email" value={me.email} />
              <InfoField icon={<MapPin className="h-3.5 w-3.5" />} label="Ville" value={me.ville} />
              <InfoField icon={<Shield className="h-3.5 w-3.5" />} label="Rôle" value="Manager" />
              <InfoField icon={<Calendar className="h-3.5 w-3.5" />} label="Membre depuis" value={formatDate(me.createdAt)} />
            </div>
          </div>

          <div className="rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.06] to-white/[0.02] p-6 backdrop-blur-sm">
            <h2 className="text-sm font-semibold text-white mb-4">
              Sécurité du compte
            </h2>
            <div className="flex items-center justify-between rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3.5 hover:bg-white/[0.05] transition-colors">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                  <Shield className="h-5 w-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">
                    Mot de passe
                  </p>
                  <p className="text-xs text-[#7a5a5a]">
                    Dernière modification il y a 3 mois
                  </p>
                </div>
              </div>
              <button className="rounded-xl px-4 py-2 text-xs font-medium bg-[#7a1e3a]/10 text-[#c98b9a] hover:bg-[#7a1e3a]/20 transition-colors border border-[#7a1e3a]/20 hover:border-[#7a1e3a]/35 hover:shadow-[0_4px_16px_rgba(122,30,58,0.1)]">
                Modifier
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoField({ icon, label, value }) {
  return (
    <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3.5 hover:bg-white/[0.05] transition-colors">
      <div className="flex items-center gap-2 text-[#7a5a5a] mb-1">
        {icon}
        <p className="text-[11px] uppercase tracking-wide font-medium">
          {label}
        </p>
      </div>
      <p className="text-sm font-medium text-white truncate">
        {value || "—"}
      </p>
    </div>
  );
}

function formatDate(dateStr) {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}