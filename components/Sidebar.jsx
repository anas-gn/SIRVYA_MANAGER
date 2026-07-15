"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  Users,
  CalendarDays,
  Settings,
  LogOut
} from "lucide-react";

const links = [
  { href: "/dashboard", label: "Vue d'ensemble", icon: LayoutDashboard },
  { href: "/dashboard/advisors", label: "Advisors", icon: Building2 },
  { href: "/dashboard/coaches", label: "Coaches", icon: Users },
  { href: "/dashboard/reservations", label: "Reservations", icon: CalendarDays },
  { href: "/dashboard/profile", label: "Mon profil", icon: Settings }
];

export default function Sidebar({ ville }) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="w-64 shrink-0 h-screen sticky top-0 bg-[#1a0a0a] border-r border-[#2d1212] flex flex-col shadow-2xl">
      {/* HEADER */}
      <div className="px-6 py-6 ">
        <div className="flex items-center gap-3">
          {/* LOGO SVG */}
          <div className="shrink-0">
            <img src="/logo_dark.png" width="170" height="50" alt="SIRVYA Logo" />
          </div>
        </div>
       
      </div>

      {/* NAVIGATION */}
      <nav className="flex-1 px-3 py-5 space-y-1">
        {links.map((l) => {
          const active = pathname === l.href;
          const Icon = l.icon;
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                active
                  ? "bg-[#7a1e3a] text-[#f5e6d3] shadow-lg shadow-[#7a1e3a]/20 border border-[#8a2e4a]"
                  : "text-[#b8a0a0] hover:bg-[#2d1212] hover:text-[#f5e6d3] group"
              }`}
            >
              <Icon
                size={18}
                strokeWidth={2}
                className={!active ? "group-hover:scale-110 transition-transform" : ""}
              />
              {l.label}
            </Link>
          );
        })}
      </nav>

      {/* FOOTER */}
      <div className="px-3 py-4 border-t border-[#2d1212]">
        
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-[#c98b9a] bg-[#2d1212] hover:bg-[#3d1a1a] hover:text-[#f5e6d3] transition-all border border-[#3d1a1a] hover:border-[#7a1e3a]"
        >
          <LogOut size={16} strokeWidth={2} />
          Se déconnecter
        </button>
      </div>
    </aside>
  );
}