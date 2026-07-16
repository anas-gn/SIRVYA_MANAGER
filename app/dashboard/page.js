import { getAuthFromCookies } from "@/lib/auth";
import { query } from "@/lib/db";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  Users,
  UserCheck,
  Clock,
  CheckCircle2,
  ArrowUpRight,
  MapPin,
  Calendar,
  Building2,
  MapPinned,
  Navigation,
} from "lucide-react";
import GrowthChart from "@/components/GrowthChart";

// Leaflet a besoin du navigateur (window/document) -> pas de SSR
const AdvisorsLocationMap = dynamic(
  () => import("@/components/Advisorslocationmap"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[300px] sm:h-[380px] min-[1920px]:h-[520px] rounded-xl border border-[#3d1a1a] bg-[#1a0a0a]/50 flex items-center justify-center text-sm text-[#a08080]">
        Chargement de la carte…
      </div>
    ),
  }
);

async function getStats(ville) {
  const [advisors] = await Promise.all([
    query(`SELECT COUNT(*) AS c FROM advisorprofiles WHERE ville = ?`, [ville]),
  ]);

  const [coaches] = await Promise.all([
    query(
      `SELECT COUNT(*) AS c FROM coachprofiles cp
       WHERE cp.ville = ? OR cp.advisorID IN (SELECT ap.userID FROM advisorprofiles ap WHERE ap.ville = ?)`,
      [ville, ville]
    ),
  ]);

  const [reservations] = await Promise.all([
    query(
      `SELECT r.status, COUNT(*) AS c FROM reservations r
       JOIN coachprofiles cp ON cp.userID = r.coachID
       WHERE cp.ville = ? OR cp.advisorID IN (SELECT ap.userID FROM advisorprofiles ap WHERE ap.ville = ?)
       GROUP BY r.status`,
      [ville, ville]
    ),
  ]);

  const resByStatus = { pending: 0, confirmed: 0, cancelled: 0 };
  for (const row of reservations) {
    resByStatus[row.status] = row.c;
  }

  return {
    advisorsCount: advisors[0]?.c || 0,
    coachesCount: coaches[0]?.c || 0,
    reservations: resByStatus,
  };
}

async function getAdvisors(ville) {
  const rows = await query(
    `SELECT
        u.id, u.firstName, u.lastName, u.email, u.avatarUrl, u.isApproved, u.createdAt,
        ap.id AS advisorProfileId, ap.specialty, ap.companyName, ap.bio, ap.ville, ap.location
     FROM advisorprofiles ap
     JOIN users u ON u.id = ap.userID
     WHERE ap.ville = ?
     ORDER BY u.createdAt DESC`,
    [ville]
  );
  return rows;
}

// ─── Récupère les données de croissance mensuelle ───
async function getGrowthData(ville) {
  const advisorGrowth = await query(
    `SELECT 
      DATE_FORMAT(u.createdAt, '%Y-%m') as month,
      COUNT(*) as count
     FROM advisorprofiles ap
     JOIN users u ON u.id = ap.userID
     WHERE ap.ville = ?
     GROUP BY DATE_FORMAT(u.createdAt, '%Y-%m')
     ORDER BY month`,
    [ville]
  );

  const coachGrowth = await query(
    `SELECT 
      DATE_FORMAT(u.createdAt, '%Y-%m') as month,
      COUNT(*) as count
     FROM coachprofiles cp
     JOIN users u ON u.id = cp.userID
     WHERE cp.ville = ? OR cp.advisorID IN (
       SELECT ap.userID FROM advisorprofiles ap WHERE ap.ville = ?
     )
     GROUP BY DATE_FORMAT(u.createdAt, '%Y-%m')
     ORDER BY month`,
    [ville, ville]
  );

  const advisorDaily = await query(
    `SELECT 
      DATE(u.createdAt) as day,
      COUNT(*) as count
     FROM advisorprofiles ap
     JOIN users u ON u.id = ap.userID
     WHERE ap.ville = ? AND u.createdAt >= DATE_SUB(NOW(), INTERVAL 30 DAY)
     GROUP BY DATE(u.createdAt)
     ORDER BY day`,
    [ville]
  );

  const coachDaily = await query(
    `SELECT 
      DATE(u.createdAt) as day,
      COUNT(*) as count
     FROM coachprofiles cp
     JOIN users u ON u.id = cp.userID
     WHERE (cp.ville = ? OR cp.advisorID IN (
       SELECT ap.userID FROM advisorprofiles ap WHERE ap.ville = ?
     )) AND u.createdAt >= DATE_SUB(NOW(), INTERVAL 30 DAY)
     GROUP BY DATE(u.createdAt)
     ORDER BY day`,
    [ville, ville]
  );

  return {
    monthly: { advisors: advisorGrowth, coaches: coachGrowth },
    daily: { advisors: advisorDaily, coaches: coachDaily },
  };
}

export default async function DashboardHome() {
  const auth = getAuthFromCookies();
  const stats = await getStats(auth.ville);
  const advisors = await getAdvisors(auth.ville);
  const growthData = await getGrowthData(auth.ville);

  const advisorsWithLocation = advisors.filter(
    (a) => a.location && a.location.trim().length > 0
  );

  const cards = [
    {
      label: "Advisors dans ma ville",
      value: stats.advisorsCount,
      href: "/dashboard/advisors",
      icon: Users,
      iconBg: "bg-[#7a1e3a]/20",
      accent: "text-[#c98b9a]",
    },
    {
      label: "Coaches dans ma ville",
      value: stats.coachesCount,
      href: "/dashboard/coaches",
      icon: UserCheck,
      iconBg: "bg-[#c98b9a]/20",
      accent: "text-[#c98b9a]",
    },
    {
      label: "Réservations en attente",
      value: stats.reservations.pending,
      href: "/dashboard/reservations?status=pending",
      icon: Clock,
      iconBg: "bg-amber-500/20",
      accent: "text-amber-400",
    },
    {
      label: "Réservations confirmées",
      value: stats.reservations.confirmed,
      href: "/dashboard/reservations?status=confirmed",
      icon: CheckCircle2,
      iconBg: "bg-emerald-500/20",
      accent: "text-emerald-400",
    },
  ];

  return (
    <div className="space-y-6 sm:space-y-8 min-[1920px]:space-y-10 min-[1920px]:max-w-[1900px] min-[1920px]:mx-auto">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#7a1e3a] via-[#5a1530] to-[#3a0e20] p-5 sm:p-8 min-[1920px]:p-10 text-white shadow-xl">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute bottom-0 left-0 -mb-4 -ml-4 h-24 w-24 rounded-full bg-[#D1F96B]/10 blur-xl" />

        <div className="relative z-10">
          <div className="flex items-center gap-2 text-[#c98b9a] text-sm min-[1920px]:text-base font-medium mb-2">
            <MapPin className="h-4 w-4 min-[1920px]:h-5 min-[1920px]:w-5" />
            <span>{auth.ville}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl min-[1920px]:text-4xl font-bold tracking-tight">
            Vue d'ensemble
          </h1>
          <p className="mt-2 text-[#c98b9a] max-w-xl min-[1920px]:max-w-2xl min-[1920px]:text-lg">
            Gérez les advisors et coaches de votre ville. Surveillez les réservations et l'activité en temps réel.
          </p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 min-[1920px]:gap-6">
        {cards.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className="group relative overflow-hidden rounded-2xl border border-[#3d1a1a] bg-[#2d1212] p-5 sm:p-6 min-[1920px]:p-7 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-[#7a1e3a]/50"
          >
            <div className="flex items-start justify-between">
              <div className={`rounded-xl ${c.iconBg} p-3 min-[1920px]:p-3.5`}>
                <c.icon className={`h-6 w-6 min-[1920px]:h-7 min-[1920px]:w-7 ${c.accent}`} />
              </div>
              <ArrowUpRight className="h-5 w-5 text-[#a08080] transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[#c98b9a]" />
            </div>

            <div className="mt-4">
              <p className="text-sm min-[1920px]:text-base font-medium text-[#a08080]">{c.label}</p>
              <p className="mt-1 text-2xl sm:text-3xl min-[1920px]:text-4xl font-bold text-[#f5e6d3] tabular-nums">
                {c.value}
              </p>
            </div>

            <div className="absolute bottom-0 left-0 h-1 w-0 bg-gradient-to-r from-[#7a1e3a] to-[#c98b9a] transition-all duration-300 group-hover:w-full" />
          </Link>
        ))}
      </div>

      {/* Tableau des nouveaux advisors */}
      <div className="rounded-2xl border border-[#3d1a1a] bg-[#2d1212]/80 backdrop-blur-sm p-4 sm:p-6 min-[1920px]:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-5 sm:mb-6">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-[#7a1e3a]/20 p-2 min-[1920px]:p-2.5 shrink-0">
              <Users className="h-5 w-5 min-[1920px]:h-6 min-[1920px]:w-6 text-[#c98b9a]" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg min-[1920px]:text-xl font-semibold text-[#f5e6d3]">
                Nouveaux Advisors
              </h2>
              <p className="text-xs sm:text-sm min-[1920px]:text-base text-[#a08080]">
                Derniers advisors créés dans votre ville
              </p>
            </div>
          </div>
          <Link
            href="/dashboard/advisors"
            className="self-start sm:self-auto inline-flex items-center gap-1 rounded-lg bg-[#7a1e3a]/20 px-4 py-2 min-[1920px]:px-5 min-[1920px]:py-2.5 text-sm min-[1920px]:text-base font-medium text-[#c98b9a] transition-colors hover:bg-[#7a1e3a]/30"
          >
            Voir tout
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
          <table className="w-full min-w-[640px] sm:min-w-0">
            <thead>
              <tr className="border-b border-[#3d1a1a] text-left">
                <th className="pb-3 text-sm min-[1920px]:text-base font-medium text-[#a08080]">Advisor</th>
                <th className="pb-3 text-sm min-[1920px]:text-base font-medium text-[#a08080]">Spécialité</th>
                <th className="hidden md:table-cell pb-3 text-sm min-[1920px]:text-base font-medium text-[#a08080]">
                  Entreprise
                </th>
                <th className="hidden md:table-cell pb-3 text-sm min-[1920px]:text-base font-medium text-[#a08080]">
                  Date de création
                </th>
                <th className="pb-3 text-sm min-[1920px]:text-base font-medium text-[#a08080]">Statut</th>
                <th className="pb-3 text-sm min-[1920px]:text-base font-medium text-[#a08080]">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#3d1a1a]/50">
              {advisors.slice(0, 10).map((advisor) => (
                <tr key={advisor.id} className="group hover:bg-[#3d1a1a]/20 transition-colors">
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 sm:h-10 sm:w-10 min-[1920px]:h-12 min-[1920px]:w-12 shrink-0 rounded-full bg-gradient-to-br from-[#7a1e3a] to-[#c98b9a] flex items-center justify-center text-sm min-[1920px]:text-base font-bold text-white">
                        {advisor.firstName?.[0]}{advisor.lastName?.[0]}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm min-[1920px]:text-base font-medium text-[#f5e6d3] whitespace-nowrap">
                          {advisor.firstName} {advisor.lastName}
                        </p>
                        <p className="text-xs min-[1920px]:text-sm text-[#a08080] truncate max-w-[180px] sm:max-w-none">
                          {advisor.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4">
                    <span className="inline-flex items-center rounded-full bg-[#7a1e3a]/20 px-2.5 py-1 text-xs min-[1920px]:text-sm font-medium text-[#c98b9a] whitespace-nowrap">
                      {advisor.specialty || "Non spécifié"}
                    </span>
                  </td>
                  <td className="hidden md:table-cell py-4">
                    <div className="flex items-center gap-2 text-sm min-[1920px]:text-base text-[#a08080]">
                      <Building2 className="h-4 w-4 text-[#a08080]/60 shrink-0" />
                      {advisor.companyName || "-"}
                    </div>
                  </td>
                  <td className="hidden md:table-cell py-4">
                    <div className="flex items-center gap-2 text-sm min-[1920px]:text-base text-[#a08080] whitespace-nowrap">
                      <Calendar className="h-4 w-4 text-[#a08080]/60 shrink-0" />
                      {new Date(advisor.createdAt).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </div>
                  </td>
                  <td className="py-4">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs min-[1920px]:text-sm font-medium whitespace-nowrap ${
                        advisor.isApproved
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "bg-amber-500/20 text-amber-400"
                      }`}
                    >
                      <div
                        className={`h-1.5 w-1.5 rounded-full ${
                          advisor.isApproved ? "bg-emerald-400" : "bg-amber-400"
                        }`}
                      />
                      {advisor.isApproved ? "Approuvé" : "En attente"}
                    </span>
                  </td>
                  <td className="py-4">
                    <Link
                      href={`/dashboard/advisors/${advisor.id}`}
                      className="inline-flex items-center gap-1 text-sm min-[1920px]:text-base font-medium text-[#c98b9a] sm:opacity-0 sm:group-hover:opacity-100 transition-opacity hover:text-[#f5e6d3] whitespace-nowrap"
                    >
                      Détails
                      <ArrowUpRight className="h-3 w-3" />
                    </Link>
                  </td>
                </tr>
              ))}
              {advisors.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[#a08080]">
                    Aucun advisor trouvé dans votre ville
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Carte avec les pins de tous les advisors */}
      <div className="rounded-2xl border border-[#3d1a1a] bg-[#2d1212]/80 backdrop-blur-sm p-4 sm:p-6 min-[1920px]:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-5 sm:mb-6">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-[#7a1e3a]/20 p-2 min-[1920px]:p-2.5 shrink-0">
              <MapPinned className="h-5 w-5 min-[1920px]:h-6 min-[1920px]:w-6 text-[#c98b9a]" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg min-[1920px]:text-xl font-semibold text-[#f5e6d3]">
                Localisation des Advisors
              </h2>
              <p className="text-xs sm:text-sm min-[1920px]:text-base text-[#a08080]">
                {advisorsWithLocation.length} advisor{advisorsWithLocation.length > 1 ? "s" : ""} géolocalisé
                {advisorsWithLocation.length > 1 ? "s" : ""} dans {auth.ville}
              </p>
            </div>
          </div>
        </div>

        <AdvisorsLocationMap ville={auth.ville} advisors={advisorsWithLocation} />

        {advisorsWithLocation.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <MapPinned className="h-12 w-12 text-[#3d1a1a] mb-3" />
            <p className="text-sm text-[#a08080]">Aucune localisation disponible pour les advisors</p>
          </div>
        )}
      </div>

      {/* ─── DIAGRAMME DE CROISSANCE ─── */}
      <GrowthChart 
        monthlyData={growthData.monthly} 
        dailyData={growthData.daily} 
      />
    </div>
  );
}