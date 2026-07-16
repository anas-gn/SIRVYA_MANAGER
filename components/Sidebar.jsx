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
    <aside
      className="w-16 sm:w-20 lg:w-64 min-[1920px]:w-80 min-[2560px]:w-96 shrink-0 h-screen sticky top-0
      bg-[#1a0a0a] border-r border-[#2d1212] flex flex-col shadow-2xl
      transition-[width] duration-200"
    >
      {/* HEADER */}
      <div className="px-2 py-4 sm:px-3 lg:px-6 lg:py-6 min-[1920px]:px-8 min-[1920px]:py-8 min-[2560px]:px-10 min-[2560px]:py-10 flex items-center justify-center lg:justify-start">
        <div className="flex items-center gap-3 min-w-0">
          {/* LOGO — icône seule sur mobile, logo complet à partir de lg */}
          <div className="shrink-0">
            <img
              src="/icon_app.png"
              alt="SIRVYA"
              className="lg:hidden h-8 w-8 sm:h-9 sm:w-9 object-contain rounded-lg"
            />
            <img
              src="/logo_dark.png"
              alt="SIRVYA Logo"
              className="hidden lg:block lg:h-[50px] min-[1920px]:h-[64px] min-[2560px]:h-[78px] w-auto object-contain"
            />
          </div>
        </div>
      </div>

      {/* NAVIGATION */}
      <nav className="flex-1 px-2 sm:px-2.5 lg:px-3 py-5 min-[1920px]:px-4 min-[1920px]:py-6 space-y-1 min-[1920px]:space-y-2">
        {links.map((l) => {
          const active = pathname === l.href;
          const Icon = l.icon;
          return (
            <Link
              key={l.href}
              href={l.href}
              title={l.label}
              className={`flex items-center justify-center lg:justify-start gap-0 lg:gap-3 min-[1920px]:gap-4
              px-2 py-2.5 sm:px-2.5 lg:px-4 min-[1920px]:px-4 min-[1920px]:py-3.5
              min-[2560px]:px-5 min-[2560px]:py-4 rounded-lg min-[1920px]:rounded-xl
              text-sm min-[1920px]:text-base min-[2560px]:text-lg font-medium transition-all ${
                active
                  ? "bg-[#7a1e3a] text-[#f5e6d3] shadow-lg shadow-[#7a1e3a]/20 border border-[#8a2e4a]"
                  : "text-[#b8a0a0] hover:bg-[#2d1212] hover:text-[#f5e6d3] group"
              }`}
            >
              <Icon
                strokeWidth={2}
                className={`w-5 h-5 lg:w-[18px] lg:h-[18px] min-[1920px]:w-6 min-[1920px]:h-6 min-[2560px]:w-7 min-[2560px]:h-7 shrink-0 ${
                  !active ? "group-hover:scale-110 transition-transform" : ""
                }`}
              />
              <span className="hidden lg:inline">{l.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* FOOTER */}
      <div className="px-2 sm:px-2.5 lg:px-3 py-4 min-[1920px]:px-4 min-[1920px]:py-5 border-t border-[#2d1212]">
        <button
          onClick={logout}
          title="Se déconnecter"
          className="w-full flex items-center justify-center gap-0 lg:gap-2 min-[1920px]:gap-3 px-2 py-2.5 lg:px-4
          min-[1920px]:px-5 min-[1920px]:py-3.5 rounded-lg min-[1920px]:rounded-xl text-sm min-[1920px]:text-base font-medium
          text-[#c98b9a] bg-[#2d1212] hover:bg-[#3d1a1a] hover:text-[#f5e6d3] transition-all border
          border-[#3d1a1a] hover:border-[#7a1e3a]"
        >
          <LogOut size={16} strokeWidth={2} className="min-[1920px]:w-5 min-[1920px]:h-5 shrink-0" />
          <span className="hidden lg:inline">Se déconnecter</span>
        </button>
      </div>
    </aside>
  );
}