"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Coins, LogOut, ShoppingCart, Shield, Store, UserRound } from "lucide-react";
import { LoginButton } from "@/components/LoginButton";
import { useSession } from "@/contexts/SessionContext";
import { formatCredits } from "@/lib/constants";
import { useCart } from "@/contexts/CartContext";

const links = [
  { href: "/", label: "Магазин", icon: Store },
  { href: "/dashboard", label: "Киты", icon: Shield },
  { href: "/profile", label: "Профиль", icon: UserRound },
];

export function Navbar() {
  const pathname = usePathname();
  const { user, loading, logout } = useSession();
  const { itemCount } = useCart();

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#08090c]/88 backdrop-blur-xl">
      <div className="mx-auto flex min-h-16 max-w-[1440px] flex-col gap-3 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-lg border border-orange-500/50 bg-orange-600 text-white shadow-lg shadow-orange-950/40">
              <Shield className="h-5 w-5" />
            </span>
            <span>
              <span className="block font-heading text-xl font-bold text-zinc-100">
                RUST Store
              </span>
              <span className="block text-xs text-zinc-500">
                Привилегии сервера
              </span>
            </span>
          </Link>
        </div>

        <nav className="flex flex-wrap items-center gap-2">
          {links.map((link) => {
            const Icon = link.icon;
            const active = pathname === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`inline-flex h-9 items-center gap-2 rounded-lg px-3 text-sm transition ${
                  active
                    ? "bg-orange-500/12 text-orange-300"
                    : "text-zinc-400 hover:bg-white/5 hover:text-zinc-100"
                }`}
              >
                <Icon className="h-4 w-4" />
                {link.label}
              </Link>
            );
          })}

          {user?.isAdmin ? (
            <Link
              href="/admin"
              className={`inline-flex h-9 items-center gap-2 rounded-lg px-3 text-sm transition ${
                pathname === "/admin"
                  ? "bg-emerald-500/15 text-emerald-200"
                  : "text-zinc-400 hover:bg-white/5 hover:text-zinc-100"
              }`}
            >
              <Shield className="h-4 w-4" />
              Админ
            </Link>
          ) : null}
        </nav>

        <div className="flex items-center gap-3 flex-wrap">
          <Link
            href="/cart"
            className={`relative inline-flex h-10 items-center gap-2 rounded-lg border px-3 text-sm font-semibold transition ${
              pathname === "/cart"
                ? "border-orange-500/40 bg-orange-500/12 text-orange-200"
                : "border-white/10 bg-white/[0.03] text-zinc-200 hover:border-orange-500/40 hover:bg-orange-500/10"
            }`}
          >
            <ShoppingCart className="h-4 w-4" />
            Корзина
            {itemCount > 0 ? (
              <span className="grid h-5 min-w-5 place-items-center rounded-full bg-orange-500 px-1 text-xs font-bold text-white">
                {itemCount}
              </span>
            ) : null}
          </Link>
          {loading ? (
            <div className="h-10 w-44 rounded-lg border border-zinc-800 bg-zinc-900 shimmer-bg" />
          ) : user ? (
            <>
              <div className="inline-flex h-10 items-center gap-2 rounded-lg border border-orange-500/25 bg-orange-500/10 px-2 sm:px-3 text-orange-100">
                <Coins className="h-4 w-4" />
                <span className="font-mono text-sm font-semibold text-orange-100">
                  {formatCredits(user.balance)}
                </span>
              </div>
              <Link
                href="/profile"
                className="flex min-w-0 items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-2 py-1.5 transition hover:border-orange-500/40"
              >
                <img
                  src={user.avatarUrl}
                  alt=""
                  className="h-7 w-7 rounded-md border border-zinc-700"
                />
                <span className="max-w-[8rem] sm:max-w-32 truncate text-sm font-medium text-zinc-200">
                  {user.username}
                </span>
              </Link>
              <button
                type="button"
                onClick={logout}
                className="grid h-10 w-10 place-items-center rounded-lg border border-zinc-800 text-zinc-400 transition hover:border-red-500/50 hover:bg-red-500/10 hover:text-red-300"
                aria-label="Logout"
                title="Выйти"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </>
          ) : (
            <LoginButton />
          )}
        </div>
      </div>
    </header>
  );
}
