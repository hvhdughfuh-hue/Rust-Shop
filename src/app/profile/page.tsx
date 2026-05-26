"use client";

import { useCallback, useEffect, useState } from "react";
import { Coins, History, ShieldCheck, UserRound } from "lucide-react";
import { CountdownTimer } from "@/components/CountdownTimer";
import { LoginButton } from "@/components/LoginButton";
import { useSession } from "@/contexts/SessionContext";
import { useToast } from "@/components/Toast";
import { formatCredits } from "@/lib/constants";

interface ProfileData {
  user: {
    id: number;
    steamId64: string;
    username: string;
    avatarUrl: string;
    balance: number;
    isAdmin: boolean;
  } | null;
  activePrivileges: Array<{
    id: number;
    tier: string;
    expiresAt: string;
    definition?: {
      label: string;
      accentClass: string;
    };
  }>;
  transactions: Array<{
    id: number;
    type: string;
    amount: number;
    balanceBefore: number;
    balanceAfter: number;
    description: string;
    createdAt: string;
  }>;
}

export default function ProfilePage() {
  const { user, loading } = useSession();
  const { showToast } = useToast();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  const loadProfile = useCallback(async () => {
    if (!user) {
      setProfile(null);
      return;
    }

    setLoadingProfile(true);
    try {
      const response = await fetch("/api/user/profile");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Не удалось загрузить профиль.");
      }

      setProfile(data);
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Не удалось загрузить профиль.",
        "error",
      );
    } finally {
      setLoadingProfile(false);
    }
  }, [showToast, user]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  if (loading) {
    return (
      <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8">
        <div className="h-40 rounded-lg border border-white/10 bg-zinc-900 shimmer-bg" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto grid max-w-3xl place-items-center px-4 py-20 text-center sm:px-6 lg:px-8">
        <div className="rounded-lg border border-white/10 bg-[#111419]/90 p-8">
          <UserRound className="mx-auto mb-4 h-10 w-10 text-orange-300" />
          <h1 className="font-heading text-3xl font-bold text-zinc-100">
            Профиль закрыт
          </h1>
          <p className="mt-3 text-zinc-400">
            Войди через Steam, чтобы увидеть баланс, покупки и активные привилегии.
          </p>
          <div className="mt-6 flex justify-center">
            <LoginButton />
          </div>
        </div>
      </div>
    );
  }

  const currentUser = profile?.user ?? user;

  return (
    <div className="mx-auto grid max-w-[1440px] gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[360px_1fr] lg:px-8">
      <aside className="h-fit rounded-lg border border-white/10 bg-[#111419]/90 p-5">
        <img
          src={currentUser.avatarUrl}
          alt=""
          className="h-24 w-24 rounded-lg border border-orange-500/30"
        />
        <h1 className="mt-4 font-heading text-4xl font-bold text-zinc-100">
          {currentUser.username}
        </h1>
        <p className="mt-1 break-all font-mono text-xs text-zinc-500">
          {currentUser.steamId64}
        </p>

        <div className="mt-5 grid gap-3">
          <div className="rounded-lg border border-orange-500/25 bg-orange-500/10 p-4">
            <div className="flex items-center gap-2 text-orange-200">
              <Coins className="h-4 w-4" />
              <span className="text-sm">Баланс</span>
            </div>
            <p className="mt-2 font-mono text-2xl font-bold text-zinc-100">
              {formatCredits(currentUser.balance)}
            </p>
          </div>
          <div className="rounded-lg border border-white/10 bg-black/20 p-4">
            <div className="flex items-center gap-2 text-zinc-300">
              <ShieldCheck className="h-4 w-4" />
              <span className="text-sm">Статус</span>
            </div>
            <p className="mt-2 text-sm text-zinc-400">
              {currentUser.isAdmin ? "Администратор" : "Игрок"}
            </p>
          </div>
        </div>
      </aside>

      <div className="grid gap-6">
        <section className="rounded-lg border border-white/10 bg-[#111419]/90 p-5">
          <div className="mb-4 flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-orange-300" />
            <h2 className="font-heading text-2xl font-bold text-zinc-100">
              Активные привилегии
            </h2>
          </div>

          {loadingProfile ? (
            <div className="h-24 rounded-lg border border-white/10 bg-zinc-900 shimmer-bg" />
          ) : profile?.activePrivileges.length ? (
            <div className="grid gap-3 md:grid-cols-2">
              {profile.activePrivileges.map((privilege) => (
                <article
                  key={privilege.id}
                  className="rounded-lg border border-white/10 bg-black/20 p-4"
                >
                  <p
                    className={`font-heading text-2xl font-bold ${
                      privilege.definition?.accentClass ?? "text-zinc-100"
                    }`}
                  >
                    {privilege.definition?.label ?? privilege.tier}
                  </p>
                  <p className="mt-2 text-sm text-zinc-500">Истекает через</p>
                  <CountdownTimer targetDate={privilege.expiresAt} />
                </article>
              ))}
            </div>
          ) : (
            <p className="rounded-lg border border-white/10 bg-black/20 p-4 text-zinc-500">
              Активных привилегий пока нет.
            </p>
          )}
        </section>

        <section className="rounded-lg border border-white/10 bg-[#111419]/90 p-5">
          <div className="mb-4 flex items-center gap-3">
            <History className="h-5 w-5 text-orange-300" />
            <h2 className="font-heading text-2xl font-bold text-zinc-100">
              История баланса
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead className="border-b border-white/10 text-xs text-zinc-500">
                <tr>
                  <th className="px-3 py-3 font-medium">Дата</th>
                  <th className="px-3 py-3 font-medium">Тип</th>
                  <th className="px-3 py-3 font-medium">Сумма</th>
                  <th className="px-3 py-3 font-medium">Баланс</th>
                  <th className="px-3 py-3 font-medium">Описание</th>
                </tr>
              </thead>
              <tbody>
                {profile?.transactions.length ? (
                  profile.transactions.map((transaction) => (
                    <tr
                      key={transaction.id}
                      className="border-b border-white/10 last:border-0"
                    >
                      <td className="px-3 py-3 text-zinc-400">
                        {new Date(transaction.createdAt).toLocaleString()}
                      </td>
                      <td className="px-3 py-3 text-zinc-200">
                        {transaction.type}
                      </td>
                      <td
                        className={`px-3 py-3 font-mono ${
                          transaction.amount >= 0
                            ? "text-emerald-300"
                            : "text-orange-300"
                        }`}
                      >
                        {formatCredits(transaction.amount)}
                      </td>
                      <td className="px-3 py-3 font-mono text-zinc-300">
                        {formatCredits(transaction.balanceAfter)}
                      </td>
                      <td className="px-3 py-3 text-zinc-400">
                        {transaction.description}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-3 py-8 text-center text-zinc-500">
                      Операций пока нет
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
