"use client";

import { useCallback, useEffect, useState } from "react";
import { Minus, Plus, Search, ShieldCheck, Users } from "lucide-react";
import { BalanceModal } from "@/components/BalanceModal";
import { formatCredits } from "@/lib/constants";
import { useToast } from "@/components/Toast";

interface AdminUser {
  id: number;
  steamId64: string;
  username: string;
  avatarUrl: string;
  balance: number;
  isAdmin: boolean;
  _count: {
    privileges: number;
    transactions: number;
  };
}

export function AdminUserTable({ onChanged }: { onChanged: () => void }) {
  const { showToast } = useToast();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{
    user: AdminUser;
    type: "credit" | "debit";
  } | null>(null);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search.trim()) {
        params.set("search", search.trim());
      }

      const response = await fetch(`/api/admin/users?${params.toString()}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to load users.");
      }

      setUsers(data.users);
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Unable to load users.", "error");
    } finally {
      setLoading(false);
    }
  }, [search, showToast]);

  useEffect(() => {
    const timer = window.setTimeout(loadUsers, 250);
    return () => window.clearTimeout(timer);
  }, [loadUsers]);

  function changed() {
    loadUsers();
    onChanged();
  }

  return (
    <section className="rounded-lg border border-zinc-800 bg-zinc-900/80">
      <div className="flex flex-col gap-4 border-b border-zinc-800 p-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-lg border border-sky-500/30 bg-sky-500/10 text-sky-300">
            <Users className="h-5 w-5" />
          </span>
          <div>
            <h2 className="font-heading text-2xl font-bold text-zinc-100">
              Users
            </h2>
            <p className="text-sm text-zinc-500">Mock players and balances</p>
          </div>
        </div>

        <label className="flex h-10 w-full max-w-sm items-center rounded-lg border border-zinc-700 bg-zinc-950 px-3 focus-within:border-amber-500/60">
          <Search className="h-4 w-4 text-zinc-500" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="h-full min-w-0 flex-1 bg-transparent px-3 text-sm text-zinc-100 outline-none"
            placeholder="Search users"
          />
        </label>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="border-b border-zinc-800 text-xs text-zinc-500">
            <tr>
              <th className="px-4 py-3 font-medium">User</th>
              <th className="px-4 py-3 font-medium">SteamID</th>
              <th className="px-4 py-3 font-medium">Balance</th>
              <th className="px-4 py-3 font-medium">Activity</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-zinc-500">
                  Loading users
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-zinc-500">
                  No users found
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="border-b border-zinc-800/80 last:border-0">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={user.avatarUrl}
                        alt=""
                        className="h-9 w-9 rounded-lg border border-zinc-700"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="truncate font-semibold text-zinc-100">
                            {user.username}
                          </span>
                          {user.isAdmin ? (
                            <ShieldCheck className="h-4 w-4 text-emerald-400" />
                          ) : null}
                        </div>
                        <span className="text-xs text-zinc-500">
                          #{user.id}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-zinc-400">
                    {user.steamId64}
                  </td>
                  <td className="px-4 py-3 font-mono font-semibold text-emerald-300">
                    {formatCredits(user.balance)}
                  </td>
                  <td className="px-4 py-3 text-zinc-400">
                    {user._count.privileges} privileges, {user._count.transactions} tx
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setModal({ user, type: "credit" })}
                        className="inline-flex h-9 items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 text-xs font-semibold text-emerald-200 transition hover:bg-emerald-500/20"
                      >
                        <Plus className="h-4 w-4" />
                        Credit
                      </button>
                      <button
                        type="button"
                        onClick={() => setModal({ user, type: "debit" })}
                        className="inline-flex h-9 items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 text-xs font-semibold text-red-200 transition hover:bg-red-500/20"
                      >
                        <Minus className="h-4 w-4" />
                        Debit
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {modal ? (
        <BalanceModal
          user={modal.user}
          type={modal.type}
          onClose={() => setModal(null)}
          onSuccess={changed}
        />
      ) : null}
    </section>
  );
}
