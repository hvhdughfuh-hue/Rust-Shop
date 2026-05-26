"use client";

import { useMemo, useState } from "react";
import { Minus, Plus, ShoppingCart, Trash2, WalletCards } from "lucide-react";
import { LoginButton } from "@/components/LoginButton";
import { useCart } from "@/contexts/CartContext";
import { useSession } from "@/contexts/SessionContext";
import { useToast } from "@/components/Toast";
import {
  PRIVILEGES,
  formatCredits,
  formatUsd,
  getPrivilegeDefinition,
} from "@/lib/constants";

export default function CartPage() {
  const {
    items,
    itemCount,
    totalCoins,
    totalUsd,
    removeItem,
    setQuantity,
    clearCart,
  } = useCart();
  const { user, refreshSession } = useSession();
  const { showToast } = useToast();
  const [checkingOut, setCheckingOut] = useState(false);

  const detailedItems = useMemo(() => {
    return items
      .map((item) => {
        const privilege = getPrivilegeDefinition(item.tier);
        return privilege ? { ...item, privilege } : null;
      })
      .filter(Boolean);
  }, [items]);

  async function checkout() {
    if (!user) {
      showToast("Войди через Steam, чтобы оформить покупку.", "info");
      return;
    }

    if (items.length === 0) {
      return;
    }

    setCheckingOut(true);

    try {
      for (const item of items) {
        for (let index = 0; index < item.quantity; index += 1) {
          const response = await fetch("/api/store/purchase", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ tier: item.tier }),
          });
          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.error || "Покупка не прошла.");
          }
        }
      }

      clearCart();
      await refreshSession();
      showToast("Покупка оформлена, привилегии активированы.", "success");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Покупка не прошла.", "error");
    } finally {
      setCheckingOut(false);
    }
  }

  return (
    <div className="mx-auto grid max-w-[1440px] gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_380px] lg:px-8">
      <section className="rounded-lg border border-white/10 bg-[#111419]/90 p-5">
        <div className="mb-5 flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-lg border border-orange-500/30 bg-orange-500/10 text-orange-300">
            <ShoppingCart className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm text-zinc-500">Оформление заказа</p>
            <h1 className="font-heading text-4xl font-bold text-zinc-100">
              Корзина
            </h1>
          </div>
        </div>

        {detailedItems.length === 0 ? (
          <div className="rounded-lg border border-white/10 bg-black/20 p-8 text-center">
            <ShoppingCart className="mx-auto mb-4 h-10 w-10 text-zinc-500" />
            <h2 className="font-heading text-2xl font-bold text-zinc-100">
              Корзина пустая
            </h2>
            <p className="mt-2 text-zinc-500">
              Добавь привилегии из магазина, и они появятся здесь.
            </p>
          </div>
        ) : (
          <div className="grid gap-3">
            {detailedItems.map((entry) => {
              if (!entry) {
                return null;
              }

              const { privilege, quantity } = entry;

              return (
                <article
                  key={privilege.tier}
                  className="grid gap-4 rounded-lg border border-white/10 bg-black/20 p-4 md:grid-cols-[1fr_auto]"
                >
                  <div className="min-w-0">
                    <p className={`font-heading text-2xl font-bold ${privilege.accentClass}`}>
                      {privilege.label}
                    </p>
                    <p className="mt-1 text-sm text-zinc-500">
                      {privilege.description}
                    </p>
                    <p className="mt-3 font-mono text-sm text-orange-200">
                      {formatUsd(privilege.usdPrice)} · {formatCredits(privilege.price)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 md:justify-end">
                    <button
                      type="button"
                      onClick={() => setQuantity(privilege.tier, quantity - 1)}
                      className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 text-zinc-300 transition hover:border-orange-500/40 hover:bg-orange-500/10"
                      aria-label="Уменьшить количество"
                      title="Уменьшить"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="grid h-9 min-w-10 place-items-center rounded-lg border border-white/10 bg-white/[0.04] px-3 font-mono text-sm text-zinc-100">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity(privilege.tier, quantity + 1)}
                      className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 text-zinc-300 transition hover:border-orange-500/40 hover:bg-orange-500/10"
                      aria-label="Увеличить количество"
                      title="Увеличить"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeItem(privilege.tier)}
                      className="grid h-9 w-9 place-items-center rounded-lg border border-red-500/25 text-red-300 transition hover:bg-red-500/10"
                      aria-label="Удалить"
                      title="Удалить"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <aside className="h-fit rounded-lg border border-white/10 bg-[#111419]/90 p-5">
        <div className="mb-4 flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-lg border border-orange-500/30 bg-orange-500/10 text-orange-300">
            <WalletCards className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm text-zinc-500">Итого</p>
            <p className="font-heading text-2xl font-bold text-zinc-100">
              {itemCount} поз.
            </p>
          </div>
        </div>

        <div className="grid gap-3 rounded-lg border border-white/10 bg-black/20 p-4">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm text-zinc-500">Цена</span>
            <span className="font-mono text-zinc-100">{formatUsd(totalUsd)}</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm text-zinc-500">К оплате балансом</span>
            <span className="font-mono text-orange-200">{formatCredits(totalCoins)}</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm text-zinc-500">Твой баланс</span>
            <span className="font-mono text-zinc-100">
              {user ? formatCredits(user.balance) : "Steam login"}
            </span>
          </div>
        </div>

        <div className="mt-5 grid gap-3">
          {user ? (
            <button
              type="button"
              onClick={checkout}
              disabled={checkingOut || itemCount === 0}
              className="inline-flex h-12 items-center justify-center rounded-lg bg-orange-500 px-5 text-sm font-bold text-white transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {checkingOut ? "Оформляем" : "Оформить"}
            </button>
          ) : (
            <LoginButton />
          )}
          {itemCount > 0 ? (
            <button
              type="button"
              onClick={clearCart}
              className="inline-flex h-10 items-center justify-center rounded-lg border border-white/10 text-sm font-semibold text-zinc-300 transition hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-200"
            >
              Очистить корзину
            </button>
          ) : null}
        </div>

        <p className="mt-4 text-xs leading-5 text-zinc-500">
          Реальная оплата не подключена: баланс пополняет админ в панели.
        </p>
      </aside>
    </div>
  );
}
