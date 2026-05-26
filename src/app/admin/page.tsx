"use client";

import { useState } from "react";
import { ShieldAlert, ShieldCheck } from "lucide-react";
import { AdminUserTable } from "@/components/AdminUserTable";
import { AuditLogTable } from "@/components/AuditLogTable";
import { AdminKitsTable } from "@/components/AdminKitsTable";
import { LoginButton } from "@/components/LoginButton";
import { useSession } from "@/contexts/SessionContext";

export default function AdminPage() {
  const { user, loading } = useSession();
  const [refreshKey, setRefreshKey] = useState(0);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="h-40 rounded-lg border border-zinc-800 bg-zinc-900 shimmer-bg" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto grid max-w-3xl place-items-center px-4 py-20 text-center sm:px-6 lg:px-8">
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/80 p-8">
          <ShieldAlert className="mx-auto mb-4 h-10 w-10 text-amber-300" />
          <h1 className="font-heading text-3xl font-bold text-zinc-100">
            Admin login required
          </h1>
          <p className="mt-3 text-zinc-400">
            Use an admin SteamID from the configured environment list.
          </p>
          <div className="mt-6 flex justify-center">
            <LoginButton />
          </div>
        </div>
      </div>
    );
  }

  if (!user.isAdmin) {
    return (
      <div className="mx-auto grid max-w-3xl place-items-center px-4 py-20 text-center sm:px-6 lg:px-8">
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-8">
          <ShieldAlert className="mx-auto mb-4 h-10 w-10 text-red-300" />
          <h1 className="font-heading text-3xl font-bold text-zinc-100">
            Access denied
          </h1>
          <p className="mt-3 text-zinc-400">
            This profile is not listed in ADMIN_STEAM_IDS.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-300">
          <ShieldCheck className="h-5 w-5" />
        </span>
        <div>
          <p className="text-sm text-zinc-500">Admin panel</p>
          <h1 className="font-heading text-4xl font-bold text-zinc-100">
            Balance control
          </h1>
        </div>
      </div>

      <AdminUserTable onChanged={() => setRefreshKey((value) => value + 1)} />
      <AuditLogTable refreshKey={refreshKey} />
      <AdminKitsTable />
    </div>
  );
}
