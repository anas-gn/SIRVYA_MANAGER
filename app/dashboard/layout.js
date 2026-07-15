import { getAuthFromCookies } from "@/lib/auth";
import { query } from "@/lib/db";
import Sidebar from "@/components/Sidebar";
import { Bell, Settings, Search } from "lucide-react";

export default async function DashboardLayout({ children }) {
  const auth = getAuthFromCookies();

  const rows = await query(
    `SELECT u.firstName, u.lastName, mp.ville
     FROM users u JOIN managerprofiles mp ON mp.userId = u.id
     WHERE u.id = ? LIMIT 1`,
    [auth.id]
  );
  const me = rows[0];

  return (
    <div className="flex min-h-screen bg-[#1a0a0a]">
      <Sidebar ville={me?.ville} />

      <div className="flex flex-1 flex-col">
      
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}