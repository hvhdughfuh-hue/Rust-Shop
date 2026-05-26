"use client";

import { useState } from "react";
import { ChevronDown, LogIn, ShieldCheck } from "lucide-react";
import { MOCK_AUTH_USERS } from "@/lib/auth/mock-provider";
import { useSession } from "@/contexts/SessionContext";

export function LoginButton() {
  const { login, loading } = useSession();
  const [open, setOpen] = useState(false);
  const isSteamMode = process.env.NEXT_PUBLIC_AUTH_MODE === "steam";

  if (isSteamMode) {
    return (
      <button
        type="button"
        onClick={() => login()}
        disabled={loading}
        className="inline-flex h-10 items-center gap-2 rounded-lg border border-orange-500/50 bg-orange-500 px-3 text-sm font-bold text-white shadow-lg shadow-orange-950/30 transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <LogIn className="h-4 w-4" />
        Войти через Steam
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        disabled={loading}
        className="inline-flex h-10 items-center gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 text-sm font-semibold text-amber-100 transition hover:border-amber-400 hover:bg-amber-500/20 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <LogIn className="h-4 w-4" />
        Mock Steam
        <ChevronDown className="h-4 w-4" />
      </button>

      {open ? (
        <div className="absolute right-0 z-50 mt-2 w-[min(18rem,92vw)] overflow-hidden rounded-lg border border-zinc-700 bg-zinc-950 shadow-2xl shadow-black/40">
          {MOCK_AUTH_USERS.map((user) => {
            const isAdmin = user.steamId64 === "76561198000000001";

            return (
              <button
                key={user.steamId64}
                type="button"
                onClick={() => login(user.steamId64)}
                className="flex w-full items-center gap-3 border-b border-zinc-800 px-3 py-3 text-left transition last:border-b-0 hover:bg-zinc-900"
              >
                <img
                  src={user.avatarUrl}
                  alt=""
                  className="h-10 w-10 shrink-0 rounded-lg border border-zinc-700"
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-zinc-100">
                    {user.username}
                  </span>
                  <span className="block truncate font-mono text-xs text-zinc-500">
                    {user.steamId64}
                  </span>
                </span>
                {isAdmin ? (
                  <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-400" />
                ) : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
