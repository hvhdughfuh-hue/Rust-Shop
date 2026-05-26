"use client";

import { useState } from "react";
import { BadgeCheck, Info, ShoppingCart, ShieldCheck } from "lucide-react";
import type { PrivilegeDefinition } from "@/lib/constants";
import { PRIVILEGE_DURATION_DAYS, formatCredits, formatUsd } from "@/lib/constants";
import { useToast } from "@/components/Toast";
import { PrivilegeModal } from "@/components/PrivilegeModal";
import { useCart } from "@/contexts/CartContext";

export function PrivilegeCard({
  privilege,
}: {
  privilege: PrivilegeDefinition;
}) {
  const { showToast } = useToast();
  const { addItem } = useCart();
  const [detailsOpen, setDetailsOpen] = useState(false);

  function addToCart() {
    addItem(privilege.tier);
    showToast(`${privilege.label} добавлен в корзину.`, "success");
  }

  return (
    <>
      <article
        className={`card-hover relative flex min-h-0 md:min-h-[410px] flex-col overflow-hidden rounded-lg border bg-[#15191f]/88 p-4 sm:p-5 shadow-xl shadow-black/30 ${privilege.borderClass}`}
      >
        {privilege.tier === "GOLD" ? (
          <span className="absolute right-4 top-4 rounded-md bg-orange-500 px-2 py-1 text-xs font-bold text-white">
            ХИТ
          </span>
        ) : null}

        <div className={`mb-5 rounded-lg border border-white/10 p-4 ${privilege.bgClass}`}>
          <div className="mb-4 grid h-16 w-16 sm:h-20 sm:w-20 place-items-center rounded-lg border border-white/10 bg-black/25">
            <BadgeCheck className={`h-9 w-9 sm:h-11 sm:w-11 ${privilege.accentClass}`} />
          </div>
          <p className="text-sm text-orange-300">{privilege.tagline}</p>
          <h2
            className={`mt-1 font-heading text-2xl sm:text-3xl font-bold ${privilege.accentClass}`}
          >
            {privilege.label}
          </h2>
          <div className="mt-3 flex flex-wrap items-end gap-2">
            <p className="font-mono text-xl sm:text-2xl font-bold text-zinc-100">
              {formatUsd(privilege.usdPrice)}
            </p>
            <p className="pb-1 font-mono text-sm text-orange-200">
              {formatCredits(privilege.price)}
            </p>
          </div>
        </div>

        <p className="text-sm leading-6 text-zinc-400">{privilege.description}</p>

        <div className="mt-5 grid gap-2">
          {privilege.features.map((feature) => (
            <div key={feature} className="flex items-center gap-2 text-sm text-zinc-300">
              <ShieldCheck className="h-4 w-4 shrink-0 text-orange-400" />
              <span>{feature}</span>
            </div>
          ))}
          <div className="flex items-center gap-2 text-sm text-zinc-300">
            <ShieldCheck className="h-4 w-4 shrink-0 text-sky-400" />
            <span>{PRIVILEGE_DURATION_DAYS} дней доступа</span>
          </div>
        </div>

        <div className="mt-auto grid grid-cols-2 gap-2 pt-6">
          <button
            type="button"
            onClick={() => setDetailsOpen(true)}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-white/10 px-3 text-sm font-semibold text-zinc-200 transition hover:border-white/20 hover:bg-white/5"
          >
            <Info className="h-4 w-4" />
            Детали
          </button>
          <button
            type="button"
            onClick={addToCart}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-orange-400/40 bg-orange-500 px-3 text-sm font-bold text-white transition hover:bg-orange-400"
          >
            <ShoppingCart className="h-4 w-4" />
            В корзину
          </button>
        </div>
      </article>

      <PrivilegeModal
        privilege={privilege}
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
      />
    </>
  );
}
