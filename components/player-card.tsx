"use client";

import Image from "next/image";
import { Link } from "@/app/i18n/navigation";
import { getFlagUrl } from "@/lib/football-constants";
import { User } from "lucide-react";

export type PlayerCardData = {
  _id: string;
  name: string;
  nickname?: string;
  slug: string;
  shirtNumber?: number;
  photoUrl?: string;
  nationality?: string;
  position: string;
  stats?: { appearances: number; goals: number; assists: number };
};

function splitName(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return { given: "", family: parts[0] };
  return { given: parts[0], family: parts.slice(1).join(" ") };
}

export function PlayerCard({
  player,
  positionLabel,
  statLabels,
}: {
  player: PlayerCardData;
  positionLabel: string;
  statLabels: { appearances: string; goals: string; assists: string };
}) {
  const displayName = player.nickname || player.name;
  const { given, family } = splitName(displayName);

  return (
    <Link
      href={{ pathname: "/plantilla/[slug]", params: { slug: player.slug } }}
      className="group block focus-visible:outline-none"
    >
      <article className="relative overflow-hidden rounded-2xl border border-neutral-200/80 bg-white shadow-card transition-all duration-normal ease-out group-hover:-translate-y-1 group-hover:border-pitch/30 group-hover:shadow-card-hover group-focus-visible:ring-2 group-focus-visible:ring-pitch">

        {/* ── 1. Top Club Banner ── */}
        <div className="relative h-20 overflow-hidden bg-linear-to-r from-pitch to-pitch-deep px-3.5 pt-3">
          {/* Subtle grass mowing pattern */}
          <div className="mow absolute inset-0 opacity-30" aria-hidden />

          <div className="relative z-10 flex items-start justify-between">
            {/* Shirt Number Badge */}
            {player.shirtNumber != null ? (
              <span className="score-display rounded-md bg-neutral-950/40 px-2 py-0.5 text-sm font-bold text-sand-300 backdrop-blur-xs">
                #{player.shirtNumber}
              </span>
            ) : (
              <span />
            )}

            {/* Nationality Flag */}
            {player.nationality && (
              <div className="overflow-hidden rounded-xs shadow-xs ring-1 ring-white/20">
                <Image
                  src={getFlagUrl(player.nationality, 80)}
                  alt={player.nationality}
                  width={22}
                  height={15}
                  className="h-3.5 w-5.5 object-cover"
                />
              </div>
            )}
          </div>
        </div>

        {/* ── 2. Player Photo Medallion (Crisp 80px framed portrait) ── */}
        <div className="relative z-10 -mt-11 flex justify-center px-4">
          <div className="flex size-20 items-center justify-center overflow-hidden rounded-full border-3 border-white bg-neutral-100 shadow-md ring-1 ring-neutral-200/60 transition-transform duration-normal ease-out group-hover:scale-105">
            {player.photoUrl ? (
              <Image
                src={player.photoUrl}
                alt={player.name}
                width={80}
                height={80}
                className="size-full object-cover object-top"
              />
            ) : (
              <div className="flex size-full items-center justify-center bg-green-50 text-pitch">
                {player.shirtNumber != null ? (
                  <span className="score-display text-2xl font-bold">
                    {player.shirtNumber}
                  </span>
                ) : (
                  <User className="size-8 text-neutral-400" />
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── 3. Identity & Position ── */}
        <div className="px-4 pt-2.5 pb-4 text-center">
          {given && (
            <p className="truncate text-xs font-medium text-neutral-400">
              {given}
            </p>
          )}
          <h3 className="display truncate text-lg font-bold text-neutral-900 group-hover:text-pitch transition-colors duration-fast">
            {family}
          </h3>

          <div className="mt-2 flex justify-center">
            <span className="inline-block rounded-full bg-green-50 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-pitch">
              {positionLabel}
            </span>
          </div>
        </div>

        {/* ── 4. Tactical Stats Matrix ── */}
        {player.stats && (
          <div className="grid grid-cols-3 divide-x divide-neutral-100 border-t border-neutral-100 bg-neutral-50/60 py-2.5 text-center">
            <div className="px-1">
              <p className="score-display text-base font-bold text-neutral-800">
                {player.stats.appearances}
              </p>
              <p className="label text-[9px] text-neutral-400">
                {statLabels.appearances}
              </p>
            </div>
            <div className="px-1">
              <p className="score-display text-base font-bold text-pitch">
                {player.stats.goals}
              </p>
              <p className="label text-[9px] text-neutral-400">
                {statLabels.goals}
              </p>
            </div>
            <div className="px-1">
              <p className="score-display text-base font-bold text-neutral-800">
                {player.stats.assists}
              </p>
              <p className="label text-[9px] text-neutral-400">
                {statLabels.assists}
              </p>
            </div>
          </div>
        )}
      </article>
    </Link>
  );
}
