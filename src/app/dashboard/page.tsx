"use client";

import { useCallback, useEffect, useState } from "react";
import { PackageOpen, ShieldAlert } from "lucide-react";
import { ActivePrivilegeCard } from "@/components/ActivePrivilegeCard";
import { LoginButton } from "@/components/LoginButton";
import { useSession } from "@/contexts/SessionContext";
import { useToast } from "@/components/Toast";

interface ActivePrivilege {
  id: number;
  tier: string;
  activatedAt: string;
  expiresAt: string;
}

export default function DashboardPage() {
  const { user, loading } = useSession();
  const { showToast } = useToast();
  const [privileges, setPrivileges] = useState<ActivePrivilege[]>([]);
  const [loadingPrivileges, setLoadingPrivileges] = useState(false);

  const loadPrivileges = useCallback(async () => {
    if (!user) {
      setPrivileges([]);
      return;
    }

    setLoadingPrivileges(true);
    try {
      const response = await fetch("/api/user/privileges");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to load privileges.");
      }

      setPrivileges(data.privileges);
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Unable to load privileges.",
        "error",
      );
    } finally {
      setLoadingPrivileges(false);
    }
  }, [showToast, user]);

  useEffect(() => {
    loadPrivileges();
  }, [loadPrivileges]);

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
            Dashboard locked
          </h1>
          <p className="mt-3 text-zinc-400">
            Select a mock Steam profile to view active privileges and claim kits.
          </p>
          <div className="mt-6 flex justify-center">
            <LoginButton />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm text-zinc-500">Player dashboard</p>
          <h1 className="font-heading text-4xl font-bold text-zinc-100">
            {user.username}
          </h1>
        </div>
        <button
          type="button"
          onClick={loadPrivileges}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-zinc-700 px-3 text-sm font-semibold text-zinc-200 transition hover:border-zinc-500 hover:bg-zinc-900"
        >
          <PackageOpen className="h-4 w-4" />
          Refresh kits
        </button>
      </div>

      {loadingPrivileges ? (
        <div className="h-64 rounded-lg border border-zinc-800 bg-zinc-900 shimmer-bg" />
      ) : privileges.length === 0 ? (
        <section className="rounded-lg border border-zinc-800 bg-zinc-900/80 p-8 text-center">
          <PackageOpen className="mx-auto mb-4 h-10 w-10 text-zinc-500" />
          <h2 className="font-heading text-2xl font-bold text-zinc-100">
            No active privileges
          </h2>
          <p className="mt-2 text-zinc-400">
            Purchased tiers will appear here with kit claim buttons.
          </p>
        </section>
      ) : (
        <div className="grid gap-5">
          {privileges.map((privilege) => (
            <ActivePrivilegeCard key={privilege.id} privilege={privilege} />
          ))}
        </div>
      )}
    </div>
  );
}
