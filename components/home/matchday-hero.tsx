"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { MapPin, CalendarDays, Clock, Navigation } from "lucide-react";

export type Match = {
  date: string;
  opponent: string;
  opponentCrestUrl?: string;
  homeOrAway: string;
  venue?: string;
  matchday?: number;
  competition?: string;
  venueMapUrl?: string;
};

export type HeroCopy = {
  nextMatch: string;
  home: string;
  away: string;
  matchday: string;
  kickoff: string;
  live: string;
  directions: string;
  days: string;
  hours: string;
  mins: string;
  secs: string;
  noMatch: string;
  noMatchBody: string;
};

function diff(target: string) {
  const ms = new Date(target).getTime() - Date.now();
  if (ms <= 0) return null;
  return {
    days: Math.floor(ms / 86_400_000),
    hours: Math.floor(ms / 3_600_000) % 24,
    mins: Math.floor(ms / 60_000) % 60,
    secs: Math.floor(ms / 1000) % 60,
  };
}

export function MatchdayHero({
  match,
  copy,
  locale,
  image = null,
}: {
  match: Match | null;
  copy: HeroCopy;
  locale: string;
  image?: string | null;
}) {
  const dl = locale === "ca" ? "ca-ES" : locale === "es" ? "es-ES" : "en-GB";

  // ── No Next Match State ──────────────────────────────────────────────────
  if (!match) {
    return (
      <section className="relative overflow-hidden bg-pitch pt-28 pb-20 sm:pt-32 sm:pb-24">
        {/* Striped Pitch Pattern */}
        <div className="mow absolute inset-0 opacity-60" aria-hidden />
        <div className="relative mx-auto max-w-6xl px-5 text-center">
          <div className="mx-auto mb-6 flex size-24 items-center justify-center rounded-2xl border border-white/15 bg-white/10 p-3 shadow-2xl backdrop-blur-md">
            <Image
              src="/clear_crest.png"
              alt="Inter Pomar"
              width={72}
              height={84}
              className="object-contain drop-shadow-md"
            />
          </div>
          <h1 className="display-hero text-white">Inter Pomar</h1>
          <p className="editorial mx-auto mt-4 max-w-md text-lg text-white/75">
            {copy.noMatchBody}
          </p>
        </div>
      </section>
    );
  }

  const kickoffDate = new Date(match.date);
  const isInterHome = match.homeOrAway === "home";

  return (
    // Top padding accounts for the 64px (h-16) fixed header + comfortable breathing room
    <section className="relative overflow-hidden bg-linear-to-b from-pitch to-pitch-deep pt-24 pb-14 sm:pt-28 sm:pb-16 md:pt-32 md:pb-20">
      {/* ── Background Layer ── */}
      <div className="absolute inset-0" aria-hidden>
        {image ? (
          <>
            <Image
              src={image}
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
            <div className="duotone absolute inset-0" />
          </>
        ) : (
          /* Striped Grass Mowing Lines */
          <div className="mow absolute inset-0 opacity-60" />
        )}
      </div>

      <div className="relative mx-auto max-w-5xl px-5">
        {/* Matchday / Eyebrow Pill */}
        <div className="flex justify-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-neutral-950/40 px-4 py-1.5 backdrop-blur-md">
            <span className="size-1.5 rounded-full bg-sand-400" />
            <span className="label text-sand-200">
              {copy.nextMatch}
              {match.matchday ? ` · ${copy.matchday} ${match.matchday}` : ""}
            </span>
          </span>
        </div>

        {/* ── Teams & Crests Section ── */}
        <div className="mt-7 grid grid-cols-[1fr_auto_1fr] items-center gap-3 sm:gap-8 md:gap-12">
          {/* Inter Pomar */}
          <div className="flex flex-col items-center text-center">
            <div className="relative flex size-24 items-center justify-center rounded-2xl border border-white/20 bg-white p-3 shadow-2xl backdrop-blur-md transition-transform duration-300 hover:scale-105 sm:size-28 md:size-32">
              <Image
                src="/clear_crest.png"
                alt="Inter Pomar"
                width={84}
                height={96}
                priority
                className="max-h-full max-w-full object-contain drop-shadow-md"
              />
            </div>
            <p className="display mt-3 text-base font-bold text-white sm:text-lg md:text-xl">
              Inter Pomar
            </p>
            <span
              className={`label mt-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold tracking-wider ${isInterHome
                ? "border border-sand-400/30 bg-sand-400/20 text-sand-200"
                : "bg-white/10 text-white/75"
                }`}
            >
              {isInterHome ? copy.home : copy.away}
            </span>
          </div>

          {/* VS Divider Badge */}
          <div className="flex flex-col items-center justify-center">
            <div className="flex size-11 items-center justify-center rounded-full border border-white/20 bg-neutral-950/60 shadow-lg backdrop-blur-md sm:size-14">
              <span className="display text-base font-bold tracking-wider text-sand-300 sm:text-xl">
                VS
              </span>
            </div>
          </div>

          {/* Opponent */}
          <div className="flex flex-col items-center text-center">
            <div className="relative flex size-24 items-center justify-center rounded-2xl border border-white/20 bg-white p-3 shadow-2xl backdrop-blur-md transition-transform duration-300 hover:scale-105 sm:size-28 md:size-32">
              {match.opponentCrestUrl ? (
                <Image
                  src={match.opponentCrestUrl}
                  alt={match.opponent}
                  width={84}
                  height={96}
                  className="max-h-full max-w-full object-contain drop-shadow-md"
                />
              ) : (
                <div className="flex size-full items-center justify-center rounded-xl bg-neutral-900/40">
                  <span className="display text-3xl font-bold text-white/60 sm:text-4xl">
                    {match.opponent.charAt(0)}
                  </span>
                </div>
              )}
            </div>
            <p className="display mt-3 max-w-[130px] truncate text-base font-bold text-white sm:max-w-[200px] sm:text-lg md:text-xl">
              {match.opponent}
            </p>
            <span
              className={`label mt-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold tracking-wider ${!isInterHome
                ? "border border-sand-400/30 bg-sand-400/20 text-sand-200"
                : "bg-white/10 text-white/75"
                }`}
            >
              {!isInterHome ? copy.home : copy.away}
            </span>
          </div>
        </div>

        {/* ── Match Details (Date, Time, Venue) ── */}
        <div className="mt-7 flex flex-wrap items-center justify-center gap-2.5 text-xs text-white/95 sm:gap-3.5 sm:text-sm">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-neutral-950/40 px-3.5 py-1.5 shadow-sm backdrop-blur-sm">
            <CalendarDays className="size-4 text-sand-300" />
            <span className="capitalize">
              {kickoffDate.toLocaleDateString(dl, {
                weekday: "short",
                day: "numeric",
                month: "long",
              })}
            </span>
          </span>

          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-neutral-950/40 px-3.5 py-1.5 shadow-sm backdrop-blur-sm">
            <Clock className="size-4 text-sand-300" />
            <span>
              {kickoffDate.toLocaleTimeString(dl, {
                hour: "2-digit",
                minute: "2-digit",
              })}
              h
            </span>
          </span>

          {match.venue && (
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-neutral-950/40 px-3.5 py-1.5 shadow-sm backdrop-blur-sm">
              <MapPin className="size-4 text-sand-300" />
              <span>{match.venue}</span>
            </span>
          )}
        </div>

        {/* ── High-Contrast Countdown ── */}
        <div className="mt-7 flex justify-center">
          <Countdown target={match.date} copy={copy} />
        </div>

        {/* ── Venue Directions CTA ── */}
        {match.venueMapUrl && (
          <div className="mt-6 text-center">
            <a
              href={match.venueMapUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-2 text-xs font-semibold text-white shadow-sm backdrop-blur-sm transition-all duration-normal hover:border-sand-300 hover:bg-white/20 hover:text-sand-100"
            >
              <Navigation className="size-3.5" />
              {copy.directions}
            </a>
          </div>
        )}
      </div>
    </section>
  );
}

/* ── Countdown Component ──────────────────────────────────────────────── */

function Countdown({ target, copy }: { target: string; copy: HeroCopy }) {
  const [left, setLeft] = useState<ReturnType<typeof diff>>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setLeft(diff(target));
    const id = setInterval(() => setLeft(diff(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

  if (mounted && !left) {
    return (
      <div className="inline-flex items-center gap-3 rounded-full border border-green-400/40 bg-neutral-950/85 px-6 py-2.5 shadow-xl backdrop-blur-md">
        <span className="relative flex size-3">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-green-400 opacity-75" />
          <span className="relative inline-flex size-3 rounded-full bg-green-500" />
        </span>
        <span className="display text-sm font-semibold tracking-widest text-white uppercase">
          {copy.live}
        </span>
      </div>
    );
  }

  const units = [
    { v: left?.days, l: copy.days },
    { v: left?.hours, l: copy.hours },
    { v: left?.mins, l: copy.mins },
    { v: left?.secs, l: copy.secs },
  ];

  return (
    <div
      className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-neutral-950/80 p-2.5 shadow-2xl backdrop-blur-md ring-1 ring-black/30 sm:gap-3 sm:p-3"
      role="timer"
      aria-live="off"
    >
      {units.map((u) => (
        <div
          key={u.l}
          className="flex min-w-[58px] flex-col items-center rounded-xl border border-white/10 bg-neutral-900/95 px-2.5 py-2 text-center shadow-inner sm:min-w-[70px] sm:px-3 sm:py-2.5"
        >
          <span className="score-display text-2xl font-bold text-white sm:text-3xl md:text-4xl">
            {u.v === undefined ? "––" : String(u.v).padStart(2, "0")}
          </span>
          <span className="label mt-1 text-[10px] font-bold text-sand-300 sm:text-[11px]">
            {u.l}
          </span>
        </div>
      ))}
    </div>
  );
}
