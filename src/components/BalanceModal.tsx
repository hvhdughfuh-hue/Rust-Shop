"use client";

import { FormEvent, useState } from "react";
import { CreditCard, Minus, Plus, X } from "lucide-react";
import { formatCredits } from "@/lib/constants";
import { useSession } from "@/contexts/SessionContext";
import { useToast } from "@/components/Toast";

interface AdminUser {
  id: number;
  username: string;
  steamId64: string;
  avatarUrl: string;
  balance: number;
}

export function BalanceModal({
  user,
  type,
  onClose,
  onSuccess,
}: {
  user: AdminUser;
  type: "credit" | "debit";
  onClose: () => void;
  onSuccess: () => void;
}) {
  const { refreshSession } = useSession();
  const { showToast } = useToast();
  const [amount, setAmount] = useState("250");
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);
  const isCredit = type === "credit";

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);

    try {
      const response = await fetch("/api/admin/balance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          amount: Number(amount),
          type,
          reason,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Balance update failed.");
      }

      await refreshSession();
      showToast(
        `${isCredit ? "Credited" : "Debited"} ${formatCredits(Number(amount))}.`,
        "success",
      );
      onSuccess();
      onClose();
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Balance update failed.",
        "error",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur-sm">
      <form
        onSubmit={submit}
        className="w-full max-w-md rounded-lg border border-zinc-700 bg-zinc-950 p-5 shadow-2xl shadow-black/60"
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-zinc-500">
              {isCredit ? "Credit balance" : "Debit balance"}
            </p>
            <h2 className="font-heading text-2xl font-bold text-zinc-100">
              {user.username}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-lg border border-zinc-800 text-zinc-400 transition hover:text-zinc-100"
            aria-label="Close balance modal"
            title="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mb-4 rounded-lg border border-zinc-800 bg-zinc-900 p-3">
          <p className="text-xs text-zinc-500">Current balance</p>
          <p className="font-mono text-lg font-semibold text-emerald-300">
            {formatCredits(user.balance)}
          </p>
        </div>

        <label className="mb-4 block">
          <span className="mb-2 block text-sm font-medium text-zinc-300">Amount</span>
          <div className="flex items-center rounded-lg border border-zinc-700 bg-zinc-900 px-3 focus-within:border-amber-500/60">
            <CreditCard className="h-4 w-4 text-zinc-500" />
            <input
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              min="1"
              step="1"
              type="number"
              className="h-11 flex-1 bg-transparent px-3 font-mono text-sm text-zinc-100 outline-none"
              required
            />
          </div>
        </label>

        <label className="mb-5 block">
          <span className="mb-2 block text-sm font-medium text-zinc-300">Reason</span>
          <textarea
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            rows={3}
            className="w-full resize-none rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none transition focus:border-amber-500/60"
            placeholder="Admin adjustment"
          />
        </label>

        <button
          type="submit"
          disabled={saving}
          className={`inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg px-4 text-sm font-bold transition disabled:cursor-wait disabled:opacity-70 ${
            isCredit
              ? "bg-emerald-500 text-zinc-950 hover:bg-emerald-400"
              : "bg-red-500 text-zinc-950 hover:bg-red-400"
          }`}
        >
          {isCredit ? <Plus className="h-4 w-4" /> : <Minus className="h-4 w-4" />}
          {saving ? "Saving" : isCredit ? "Credit" : "Debit"}
        </button>
      </form>
    </div>
  );
}
