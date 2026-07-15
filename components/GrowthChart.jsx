"use client";

import { useMemo, useState } from "react";
import {
  ComposedChart,
  Bar,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { BarChart3, Users, UserCheck, TrendingUp, TrendingDown } from "lucide-react";

// Prérequis (à installer dans le projet) :
//   npm install recharts

const MONTHS = [
  "Jan", "Fév", "Mar", "Avr", "Mai", "Juin",
  "Juil", "Août", "Sep", "Oct", "Nov", "Déc",
];

function formatMonthlyData(monthlyData) {
  const advisors = new Array(12).fill(0);
  const coaches = new Array(12).fill(0);

  monthlyData.advisors.forEach((row) => {
    const monthIndex = parseInt(row.month.split("-")[1]) - 1;
    if (monthIndex >= 0 && monthIndex < 12) advisors[monthIndex] = row.count;
  });
  monthlyData.coaches.forEach((row) => {
    const monthIndex = parseInt(row.month.split("-")[1]) - 1;
    if (monthIndex >= 0 && monthIndex < 12) coaches[monthIndex] = row.count;
  });

  return MONTHS.map((label, i) => ({
    label,
    advisors: advisors[i],
    coaches: coaches[i],
    total: advisors[i] + coaches[i],
  }));
}

function formatDailyData(dailyData) {
  const today = new Date();
  const days = [];
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    days.push({
      key: date.toISOString().slice(0, 10),
      label: `${date.getDate()}/${date.getMonth() + 1}`,
      advisors: 0,
      coaches: 0,
    });
  }
  const byKey = Object.fromEntries(days.map((d) => [d.key, d]));

  dailyData.advisors.forEach((row) => {
    const key = new Date(row.day).toISOString().slice(0, 10);
    if (byKey[key]) byKey[key].advisors = row.count;
  });
  dailyData.coaches.forEach((row) => {
    const key = new Date(row.day).toISOString().slice(0, 10);
    if (byKey[key]) byKey[key].coaches = row.count;
  });

  return days.map((d) => ({ ...d, total: d.advisors + d.coaches }));
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const advisors = payload.find((p) => p.dataKey === "advisors")?.value ?? 0;
  const coaches = payload.find((p) => p.dataKey === "coaches")?.value ?? 0;

  return (
    <div className="rounded-xl border border-[#3d1a1a] bg-[#1a0a0a]/95 backdrop-blur-md px-4 py-3 shadow-2xl">
      <p className="text-xs font-semibold text-[#f5e6d3] mb-2">{label}</p>
      <div className="flex items-center gap-2 text-xs mb-1">
        <span className="h-2 w-2 rounded-full bg-[#c98b9a]" />
        <span className="text-[#a08080]">Advisors</span>
        <span className="ml-auto font-semibold text-[#f5e6d3] tabular-nums">{advisors}</span>
      </div>
      <div className="flex items-center gap-2 text-xs">
        <span className="h-2 w-2 rounded-full bg-[#D1F96B]" />
        <span className="text-[#a08080]">Coaches</span>
        <span className="ml-auto font-semibold text-[#f5e6d3] tabular-nums">{coaches}</span>
      </div>
    </div>
  );
}

export default function GrowthChart({ monthlyData, dailyData }) {
  const [view, setView] = useState("month"); // "month" | "day"

  const data = useMemo(
    () => (view === "month" ? formatMonthlyData(monthlyData) : formatDailyData(dailyData)),
    [view, monthlyData, dailyData]
  );

  const totalAdvisors = data.reduce((a, b) => a + b.advisors, 0);
  const totalCoaches = data.reduce((a, b) => a + b.coaches, 0);

  // Trend: compare second half vs first half of the visible period
  const mid = Math.floor(data.length / 2);
  const firstHalf = data.slice(0, mid).reduce((a, b) => a + b.total, 0);
  const secondHalf = data.slice(mid).reduce((a, b) => a + b.total, 0);
  const trendUp = secondHalf >= firstHalf;
  const trendPct =
    firstHalf === 0
      ? secondHalf > 0
        ? 100
        : 0
      : Math.round(((secondHalf - firstHalf) / firstHalf) * 100);

  // Only show every nth label on the 30-day view to avoid crowding
  const tickFormatter = (value, index) => {
    if (view === "month") return value;
    return index % 4 === 0 || index === data.length - 1 ? value : "";
  };

  return (
    <div className="rounded-2xl border border-[#3d1a1a] bg-gradient-to-b from-[#2d1212]/90 to-[#2d1212]/60 backdrop-blur-sm p-6 shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-gradient-to-br from-[#7a1e3a]/30 to-[#7a1e3a]/10 p-2.5">
            <BarChart3 className="h-5 w-5 text-[#c98b9a]" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-[#f5e6d3]">Croissance</h2>
            <p className="text-sm text-[#a08080]">Inscriptions advisors &amp; coaches</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div
            className={`hidden sm:flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
              trendUp
                ? "bg-emerald-500/15 text-emerald-400"
                : "bg-rose-500/15 text-rose-400"
            }`}
          >
            {trendUp ? (
              <TrendingUp className="h-3.5 w-3.5" />
            ) : (
              <TrendingDown className="h-3.5 w-3.5" />
            )}
            {Math.abs(trendPct)}%
          </div>

          <div className="flex rounded-lg border border-[#3d1a1a] bg-[#1a0a0a] p-1">
            <button
              onClick={() => setView("month")}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                view === "month"
                  ? "bg-[#7a1e3a] text-[#f5e6d3] shadow-sm"
                  : "text-[#a08080] hover:text-[#c98b9a]"
              }`}
            >
              Mois
            </button>
            <button
              onClick={() => setView("day")}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                view === "day"
                  ? "bg-[#7a1e3a] text-[#f5e6d3] shadow-sm"
                  : "text-[#a08080] hover:text-[#c98b9a]"
              }`}
            >
              30 Jours
            </button>
          </div>
        </div>
      </div>

      {/* Stats summary */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="rounded-xl border border-[#3d1a1a] bg-[#1a0a0a]/50 p-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-[#7a1e3a]/20 flex items-center justify-center">
            <Users className="h-5 w-5 text-[#c98b9a]" />
          </div>
          <div>
            <p className="text-2xl font-bold text-[#f5e6d3] tabular-nums">{totalAdvisors}</p>
            <p className="text-xs text-[#a08080]">Advisors {view === "month" ? "cette année" : "ce mois"}</p>
          </div>
        </div>
        <div className="rounded-xl border border-[#3d1a1a] bg-[#1a0a0a]/50 p-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-[#D1F96B]/15 flex items-center justify-center">
            <UserCheck className="h-5 w-5 text-[#D1F96B]" />
          </div>
          <div>
            <p className="text-2xl font-bold text-[#f5e6d3] tabular-nums">{totalCoaches}</p>
            <p className="text-xs text-[#a08080]">Coaches {view === "month" ? "cette année" : "ce mois"}</p>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-[320px] w-full -ml-2">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="advisorBar" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#c98b9a" stopOpacity={0.95} />
                <stop offset="100%" stopColor="#7a1e3a" stopOpacity={0.55} />
              </linearGradient>
              <linearGradient id="coachBar" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#e8ffb0" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#D1F96B" stopOpacity={0.35} />
              </linearGradient>
              <linearGradient id="totalArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f5e6d3" stopOpacity={0.18} />
                <stop offset="100%" stopColor="#f5e6d3" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid
              vertical={false}
              stroke="rgba(61, 26, 26, 0.4)"
              strokeDasharray="3 6"
            />

            <XAxis
              dataKey="label"
              tickFormatter={tickFormatter}
              tick={{ fill: "#a08080", fontSize: 11 }}
              axisLine={{ stroke: "rgba(61,26,26,0.5)" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "#a08080", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
              width={32}
            />

            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: "rgba(122,30,58,0.08)" }}
            />

            <Area
              type="monotone"
              dataKey="total"
              stroke="none"
              fill="url(#totalArea)"
              isAnimationActive
              animationDuration={600}
            />

            <Bar
              dataKey="advisors"
              fill="url(#advisorBar)"
              radius={[6, 6, 0, 0]}
              maxBarSize={26}
              isAnimationActive
              animationDuration={600}
            />
            <Bar
              dataKey="coaches"
              fill="url(#coachBar)"
              radius={[6, 6, 0, 0]}
              maxBarSize={26}
              isAnimationActive
              animationDuration={600}
              animationBegin={80}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-8 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-gradient-to-br from-[#c98b9a] to-[#7a1e3a]" />
          <span className="text-sm text-[#a08080]">Advisors</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-gradient-to-br from-[#e8ffb0] to-[#D1F96B]" />
          <span className="text-sm text-[#a08080]">Coaches</span>
        </div>
      </div>
    </div>
  );
}