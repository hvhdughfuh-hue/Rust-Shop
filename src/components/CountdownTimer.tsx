"use client";

import { useEffect, useMemo, useState } from "react";

function secondsUntil(targetDate: string) {
  return Math.max(
    0,
    Math.ceil((new Date(targetDate).getTime() - Date.now()) / 1000),
  );
}

function formatDuration(totalSeconds: number) {
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`;
  }

  return `${hours}h ${minutes}m ${seconds}s`;
}

export function CountdownTimer({
  targetDate,
  compact = false,
}: {
  targetDate: string;
  compact?: boolean;
}) {
  const [remaining, setRemaining] = useState(() => secondsUntil(targetDate));

  useEffect(() => {
    setRemaining(secondsUntil(targetDate));
    const interval = window.setInterval(() => {
      setRemaining(secondsUntil(targetDate));
    }, 1000);

    return () => window.clearInterval(interval);
  }, [targetDate]);

  const label = useMemo(() => {
    if (remaining <= 0) {
      return "Ready";
    }

    return formatDuration(remaining);
  }, [remaining]);

  return (
    <span
      className={`font-mono font-semibold ${
        compact ? "text-xs" : "text-sm"
      } ${remaining <= 0 ? "text-emerald-300" : "text-amber-200"}`}
    >
      {label}
    </span>
  );
}
