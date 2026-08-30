"use client";

import Image from "next/image";
import { Link } from "@/app/i18n/navigation";
import { getFlagUrl } from "@/lib/football-constants";
import { User, Shirt, Goal, Footprints } from "lucide-react";

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
      href={`/plantilla/${player.slug}`}
      className="group flex h-full flex-col focus-visible:outline-none"
    >
      <article className="relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-neutral-200/80 bg-white shadow-card transition-all duration-normal ease-out group-hover:-translate-y-1 group-hover:border-pitch/30 group-hover:shadow-card-hover group-focus-visible:ring-2 group-focus-visible:ring-pitch">

        {/* ── Top & Middle section (flex-1 expands to equalize all card heights) ── */}
        <div className="flex flex-1 flex-col">
          {/* ── 1. Top Club Banner ── */}
          <div className="relative h-24 shrink-0 overflow-hidden bg-linear-to-r from-pitch to-pitch-deep px-3.5 pt-3">
            {/* Pitch grass mowing stripes */}
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

          <div className="relative z-10 -mt-12 flex shrink-0 justify-center px-4 sm:-mt-13">
            <div className="flex size-24 items-center justify-center overflow-hidden rounded-full border-3 border-white bg-black shadow-md ring-1 ring-neutral-200/60 transition-transform duration-normal ease-out group-hover:scale-105 sm:size-26">
              {player.photoUrl ? (
                <Image
                  src={player.photoUrl}
                  alt={player.name}
                  width={104}
                  height={104}
                  className="size-full object-contain object-top"
                />
              ) : (
                <div className="flex size-full items-center justify-center bg-green-50 text-pitch">
                  {player.shirtNumber != null ? (
                    <span className="score-display text-3xl font-bold">
                      {player.shirtNumber}
                    </span>
                  ) : (
                    <User className="size-10 text-neutral-400" />
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ── 3. Identity & Position (flex-1 ensures bottom alignment) ── */}
          <div className="flex flex-1 flex-col items-center justify-between px-4 pt-2.5 pb-4 text-center">
            <div className="w-full">
              {/* Preserves an identical 16px line slot for single-name players */}
              <p className="min-h-[16px] truncate text-xs font-medium text-neutral-400">
                {given || "\u00A0"}
              </p>
              <h3 className="display truncate text-lg font-bold text-neutral-900 transition-colors duration-fast group-hover:text-pitch">
                {family}
              </h3>
            </div>

            <div className="mt-2 flex justify-center">
              <span className="inline-block rounded-full bg-green-50 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-pitch">
                {positionLabel}
              </span>
            </div>
          </div>
        </div>

        {/* ── 4. Tactical Stats Matrix (Icon + Tooltip Pattern) ── */}
        {player.stats && (
          <div className="shrink-0 border-t border-neutral-200/70 bg-neutral-50/60">
            <div className="grid grid-cols-3 divide-x divide-neutral-200/60 text-center">

              {/* Appearances */}
              <div
                className="group/stat relative flex items-center justify-center gap-1.5 py-2.5 transition-colors hover:bg-neutral-100/70"
                title={statLabels.appearances}
                aria-label={`${player.stats.appearances} ${statLabels.appearances}`}
              >
                <Shirt className="size-3.5 shrink-0 text-neutral-400 transition-colors group-hover/stat:text-neutral-700" aria-hidden />
                <span className="score-display text-sm font-bold text-neutral-800 sm:text-base">
                  {player.stats.appearances}
                </span>

                {/* Floating Tooltip on Hover */}
                <span className="pointer-events-none absolute -top-8 left-1/2 z-30 hidden -translate-x-1/2 rounded-md bg-neutral-900 px-2 py-0.5 text-[10px] font-semibold whitespace-nowrap text-white shadow-md group-hover/stat:block">
                  {statLabels.appearances}
                </span>
              </div>

              {/* Goals */}
              <div
                className="group/stat relative flex items-center justify-center gap-1.5 py-2.5 transition-colors hover:bg-neutral-100/70"
                title={statLabels.goals}
                aria-label={`${player.stats.goals} ${statLabels.goals}`}
              >
                <Goal className="size-3.5 shrink-0 text-pitch" aria-hidden />
                <span className="score-display text-sm font-bold text-pitch sm:text-base">
                  {player.stats.goals}
                </span>

                {/* Floating Tooltip on Hover */}
                <span className="pointer-events-none absolute -top-8 left-1/2 z-30 hidden -translate-x-1/2 rounded-md bg-neutral-900 px-2 py-0.5 text-[10px] font-semibold whitespace-nowrap text-white shadow-md group-hover/stat:block">
                  {statLabels.goals}
                </span>
              </div>

              {/* Assists */}
              <div
                className="group/stat relative flex items-center justify-center gap-1.5 py-2.5 transition-colors hover:bg-neutral-100/70"
                title={statLabels.assists}
                aria-label={`${player.stats.assists} ${statLabels.assists}`}
              >
                <Footprints className="size-3.5 shrink-0 text-neutral-400 transition-colors group-hover/stat:text-neutral-700" aria-hidden />
                <span className="score-display text-sm font-bold text-neutral-800 sm:text-base">
                  {player.stats.assists}
                </span>

                {/* Floating Tooltip on Hover */}
                <span className="pointer-events-none absolute -top-8 left-1/2 z-30 hidden -translate-x-1/2 rounded-md bg-neutral-900 px-2 py-0.5 text-[10px] font-semibold whitespace-nowrap text-white shadow-md group-hover/stat:block">
                  {statLabels.assists}
                </span>
              </div>

            </div>
          </div>
        )}
      </article>
    </Link>
  );
}
