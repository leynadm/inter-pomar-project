"use client";

import { useEffect, useState } from "react";

type Remaining = { days: number; hours: number; mins: number; secs: number };

function remaining(target: string): Remaining | null {
  const ms = new Date(target).getTime() - Date.now();
  if (ms <= 0) return null;
  return {
    days: Math.floor(ms / 86_400_000),
    hours: Math.floor(ms / 3_600_000) % 24,
    mins: Math.floor(ms / 60_000) % 60,
    secs: Math.floor(ms / 1000) % 60,
  };
}

/**
 * Renders nothing on the server pass and dashes until mounted — the clock is
 * client-only, so this avoids a hydration mismatch on every page load.
 */
export function MatchdayCountdown({
  target,
  labels,
  liveLabel,
}: {
  target: string;
  labels: { days: string; hours: string; mins: string; secs: string };
  liveLabel: string;
}) {
  const [left, setLeft] = useState<Remaining | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setLeft(remaining(target));
    const id = setInterval(() => setLeft(remaining(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

  if (mounted && !left) {
    return (
      <div className="inline-flex items-center gap-2.5 border border-sand/40 bg-sand/10 px-4 py-2.5">
        <span className="size-2 animate-pulse rounded-full bg-sand" />
        <span className="font-display text-sm uppercase tracking-[0.2em] text-sand">
          {liveLabel}
        </span>
      </div>
    );
  }

  const tiles = [
    { v: left?.days, label: labels.days },
    { v: left?.hours, label: labels.hours },
    { v: left?.mins, label: labels.mins },
    { v: left?.secs, label: labels.secs },
  ];

  return (
    <div className="flex gap-1.5" role="timer" aria-live="off">
      {tiles.map((t) => (
        <div
          key={t.label}
          className="min-w-16 border border-line-strong bg-night/45 px-3 py-2 text-center backdrop-blur-sm sm:min-w-20 sm:px-4 sm:py-2.5"
        >
          <p className="score-display text-3xl text-chalk sm:text-4xl">
            {t.v === undefined ? "––" : String(t.v).padStart(2, "0")}
          </p>
          <p className="eyebrow mt-1.5 text-[0.625rem] tracking-[0.2em]">
            {t.label}
          </p>
        </div>
      ))}
    </div>
  );
}
