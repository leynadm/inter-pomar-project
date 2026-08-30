"use client";

import { useState } from "react";
import Image from "next/image";
import { Link } from "@/app/i18n/navigation";
import {
  Goal,
  Footprints,
  Flame,
  Trophy,
  User,
  ChevronRight,
  Layers,
} from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────────────────

export type SeasonPlayerStat = {
  _id: string;
  name: string;
  slug: string;
  appearances: number;
  goals: number;
  assists: number;
  contributions: number;
  goalsPerMatch: string;
  assistsPerMatch: string;
  photoUrl?: string;
};

export type SeasonTotals = {
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  form: ("W" | "D" | "L")[];
};

export type SeasonScope = {
  totals: SeasonTotals;
  scorers: SeasonPlayerStat[];
  assisters: SeasonPlayerStat[];
  contributions: SeasonPlayerStat[];
  leaderboard: SeasonPlayerStat[];
};

export type SeasonData = {
  all: SeasonScope;
  league: SeasonScope;
  friendly: SeasonScope;
  cup: SeasonScope;
};

export type SeasonCopy = {
  season?: string;
  played?: string;
  record?: string;
  goalsFor?: string;
  goalsAgainst?: string;
  form?: string;
  scorers?: string;
  assists?: string;
  contributions?: string;
  goals?: string;
  noScorers?: string;
  noAssisters?: string;
  tableTitle?: string;
  player?: string;
  goalsPerMatch?: string;
  assistsPerMatch?: string;
};

export type SeasonPanelProps = {
  data?: SeasonData;
  totals?: SeasonTotals;
  scorers?: SeasonPlayerStat[];
  assisters?: SeasonPlayerStat[];
  contributions?: SeasonPlayerStat[];
  leaderboard?: SeasonPlayerStat[];
  copy?: SeasonCopy;
};

// ─── Component ──────────────────────────────────────────────────────────────

export function SeasonPanel({
  data,
  totals: propTotals,
  scorers: propScorers = [],
  assisters: propAssisters = [],
  contributions: propContributions = [],
  leaderboard: propLeaderboard = [],
  copy = {},
}: SeasonPanelProps) {
  // Resolve data whether passed as `data={...}` or individual fallback props
  const defaultScope: SeasonScope = {
    totals: propTotals ?? {
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      form: [],
    },
    scorers: propScorers,
    assisters: propAssisters,
    contributions: propContributions,
    leaderboard: propLeaderboard,
  };

  const resolvedData: SeasonData = data ?? {
    all: defaultScope,
    league: defaultScope,
    friendly: {
      totals: {
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        form: [],
      },
      scorers: [],
      assisters: [],
      contributions: [],
      leaderboard: [],
    },
    cup: {
      totals: {
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        form: [],
      },
      scorers: [],
      assisters: [],
      contributions: [],
      leaderboard: [],
    },
  };

  const [activeComp, setActiveComp] = useState<
    "all" | "league" | "friendly" | "cup"
  >("all");

  const activeScope = resolvedData[activeComp] || resolvedData.all;
  const { totals, scorers, assisters, contributions, leaderboard } = activeScope;
  const goalDiff = totals.goalsFor - totals.goalsAgainst;

  // Competition filter tabs
  const competitions = [
    {
      key: "all" as const,
      label: "General (Totes)",
      count: resolvedData.all.totals.played,
    },
    {
      key: "league" as const,
      label: "Lliga Sènior",
      count: resolvedData.league.totals.played,
    },
    {
      key: "friendly" as const,
      label: "Amistosos",
      count: resolvedData.friendly.totals.played,
    },
    ...(resolvedData.cup.totals.played > 0
      ? [
        {
          key: "cup" as const,
          label: "Copa",
          count: resolvedData.cup.totals.played,
        },
      ]
      : []),
  ];

  return (
    <div className="space-y-8">
      {/* ── Competition Selector Bar ── */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-200/80 pb-4">
        <div className="flex items-center gap-2">
          <Layers className="size-4 text-pitch" />
          <span className="display text-sm font-bold text-neutral-800">
            Competició:
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {competitions.map((c) => {
            const isActive = activeComp === c.key;
            return (
              <button
                key={c.key}
                onClick={() => setActiveComp(c.key)}
                className={`display inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold tracking-wider transition-all ${isActive
                    ? "bg-pitch text-white shadow-sm"
                    : "border border-neutral-200 bg-white text-neutral-600 hover:border-pitch hover:text-pitch"
                  }`}
              >
                {c.label}
                <span
                  className={`score-display ml-1 rounded-full px-1.5 py-0.2 text-[10px] ${isActive
                      ? "bg-white/20 text-white"
                      : "bg-neutral-100 text-neutral-500"
                    }`}
                >
                  {c.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── 1. Team Summary Tiles ── */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6">
        {/* Matches Played */}
        <StatTile
          label={copy.played ?? "Partits Jugats"}
          value={totals.played}
        />

        {/* Record W-D-L */}
        <StatTile
          label={copy.record ?? "V · E · D"}
          value={`${totals.won}-${totals.drawn}-${totals.lost}`}
          sub={`${totals.played > 0
              ? Math.round((totals.won / totals.played) * 100)
              : 0
            }% victòries`}
        />

        {/* Goals Scored */}
        <StatTile
          label={copy.goalsFor ?? "Gols a Favor"}
          value={totals.goalsFor}
          accent
        />

        {/* Goals Conceded */}
        <StatTile
          label={copy.goalsAgainst ?? "Gols en Contra"}
          value={totals.goalsAgainst}
        />

        {/* Goal Difference */}
        <StatTile
          label="Diferència (DG)"
          value={goalDiff > 0 ? `+${goalDiff}` : goalDiff}
          accent={goalDiff > 0}
        />

        {/* Form Strip */}
        <div className="col-span-2 flex flex-col justify-between rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-card sm:col-span-4 lg:col-span-1">
          <p className="label text-[10px] text-neutral-400">
            {copy.form ?? "Forma Recent"}
          </p>
          <div className="mt-2 flex items-center gap-1.5">
            {totals.form.length === 0 ? (
              <span className="text-xs text-neutral-400">--</span>
            ) : (
              totals.form.map((outcome, i) => (
                <span
                  key={i}
                  className={`score-display flex size-7 items-center justify-center rounded-lg text-xs font-bold text-white shadow-2xs ${outcome === "W"
                      ? "bg-result-win"
                      : outcome === "D"
                        ? "bg-result-draw"
                        : "bg-result-loss"
                    }`}
                >
                  {outcome}
                </span>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ── 2. Top Performers Cards (Goals / Assists / G+A) ── */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Top Scorers */}
        <LeaderCard
          title={copy.scorers ?? "Màxims Golejadors"}
          icon={<Goal className="size-4 text-pitch" />}
          players={scorers}
          metricKey="goals"
          metricSuffix="gols"
          emptyText={copy.noScorers ?? "Cap gol registrat"}
        />

        {/* Top Assisters */}
        <LeaderCard
          title={copy.assists ?? "Màxims Assistents"}
          icon={<Footprints className="size-4 text-pitch" />}
          players={assisters}
          metricKey="assists"
          metricSuffix="assist."
          emptyText={copy.noAssisters ?? "Cap assistència registrada"}
        />

        {/* Top G+A Combined */}
        <LeaderCard
          title={copy.contributions ?? "Gols + Assistències (G+A)"}
          icon={<Flame className="size-4 text-pitch" />}
          players={contributions}
          metricKey="contributions"
          metricSuffix="G+A"
          emptyText="Sense registres"
          isCombined
        />
      </div>

      {/* ── 3. Individual Season Leaderboard Table ── */}
      {leaderboard.length > 0 ? (
        <div className="overflow-hidden rounded-2xl border border-neutral-200/80 bg-white shadow-card">
          <div className="flex items-center justify-between border-b border-neutral-100 bg-neutral-50/70 px-6 py-4">
            <div className="flex items-center gap-2.5">
              <Trophy className="size-4 text-pitch" />
              <h3 className="display text-base font-bold text-neutral-900">
                {copy.tableTitle ?? "Rendiment Individual"} (
                {competitions.find((c) => c.key === activeComp)?.label})
              </h3>
            </div>
            <span className="label text-neutral-400">
              {leaderboard.length} jugadors
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-neutral-100 bg-neutral-50/40 text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
                <tr>
                  <th scope="col" className="px-5 py-3.5">
                    #
                  </th>
                  <th scope="col" className="px-5 py-3.5">
                    Jugador
                  </th>
                  <th scope="col" className="px-4 py-3.5 text-center">
                    PJ
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3.5 text-center font-bold text-pitch"
                  >
                    Gols
                  </th>
                  <th scope="col" className="px-4 py-3.5 text-center">
                    Assist.
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3.5 text-center font-bold text-neutral-900"
                  >
                    G+A
                  </th>
                  <th scope="col" className="px-4 py-3.5 text-center">
                    G / Partit
                  </th>
                  <th scope="col" className="px-4 py-3.5 text-center">
                    A / Partit
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {leaderboard.map((p, idx) => (
                  <tr
                    key={p._id}
                    className="transition-colors duration-fast hover:bg-neutral-50/80"
                  >
                    <td className="score-display px-5 py-3.5 text-xs font-medium text-neutral-400">
                      {idx + 1}
                    </td>
                    <td className="px-5 py-3.5">
                      <Link
                        href={`/plantilla/${p.slug}`}
                        className="group inline-flex items-center gap-3"
                      >
                        <div className="size-8 shrink-0 overflow-hidden rounded-full border border-neutral-200 bg-black">
                          {p.photoUrl ? (
                            <Image
                              src={p.photoUrl}
                              alt={p.name}
                              width={32}
                              height={32}
                              className="size-full object-contain object-top"
                            />
                          ) : (
                            <div className="flex size-full items-center justify-center bg-green-50 text-pitch">
                              <User className="size-4 text-neutral-400" />
                            </div>
                          )}
                        </div>
                        <span className="display font-bold text-neutral-900 transition-colors group-hover:text-pitch">
                          {p.name}
                        </span>
                      </Link>
                    </td>
                    <td className="score-display px-4 py-3.5 text-center font-medium text-neutral-700">
                      {p.appearances}
                    </td>
                    <td className="score-display px-4 py-3.5 text-center font-bold text-pitch">
                      {p.goals}
                    </td>
                    <td className="score-display px-4 py-3.5 text-center font-medium text-neutral-700">
                      {p.assists}
                    </td>
                    <td className="score-display bg-neutral-50/50 px-4 py-3.5 text-center font-bold text-neutral-900">
                      {p.contributions}
                    </td>
                    <td className="score-display px-4 py-3.5 text-center text-xs text-neutral-500">
                      {p.goalsPerMatch}
                    </td>
                    <td className="score-display px-4 py-3.5 text-center text-xs text-neutral-500">
                      {p.assistsPerMatch}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-neutral-200/80 bg-white p-8 text-center text-sm text-neutral-400 shadow-card">
          Encara no hi ha estadístiques registrades per a aquesta competició.
        </div>
      )}
    </div>
  );
}

// ─── Sub-Components ─────────────────────────────────────────────────────────

function StatTile({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string | number;
  sub?: string;
  accent?: boolean;
}) {
  return (
    <div className="flex flex-col justify-between rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-card">
      <p className="label text-[10px] text-neutral-400">{label}</p>
      <div className="mt-2">
        <p
          className={`score-display text-2xl font-bold ${accent ? "text-pitch" : "text-neutral-900"
            }`}
        >
          {value}
        </p>
        {sub && <p className="mt-0.5 text-[11px] text-neutral-400">{sub}</p>}
      </div>
    </div>
  );
}

function LeaderCard({
  title,
  icon,
  players,
  metricKey,
  metricSuffix,
  emptyText,
  isCombined,
}: {
  title: string;
  icon: React.ReactNode;
  players: SeasonPlayerStat[];
  metricKey: "goals" | "assists" | "contributions";
  metricSuffix: string;
  emptyText: string;
  isCombined?: boolean;
}) {
  return (
    <div className="flex flex-col rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-card">
      <div className="mb-4 flex items-center justify-between border-b border-neutral-100 pb-3">
        <div className="flex items-center gap-2">
          <span className="h-4 w-1 shrink-0 rounded-sm bg-pitch" aria-hidden />
          <h4 className="display text-sm font-bold tracking-wide text-neutral-800">
            {title}
          </h4>
        </div>
        {icon}
      </div>

      {players.length === 0 ? (
        <div className="flex flex-1 items-center justify-center py-8 text-center text-xs text-neutral-400">
          {emptyText}
        </div>
      ) : (
        <ul className="divide-y divide-neutral-100">
          {players.map((p, idx) => (
            <li key={p._id} className="py-2.5 first:pt-0 last:pb-0">
              <Link
                href={`/plantilla/${p.slug}`}
                className="group flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <span className="score-display w-4 text-xs font-bold text-neutral-400">
                    {idx + 1}
                  </span>

                  <div className="size-8 shrink-0 overflow-hidden rounded-full border border-neutral-200 bg-black">
                    {p.photoUrl ? (
                      <Image
                        src={p.photoUrl}
                        alt={p.name}
                        width={32}
                        height={32}
                        className="size-full object-contain object-top"
                      />
                    ) : (
                      <div className="flex size-full items-center justify-center bg-green-50 text-pitch">
                        <User className="size-4 text-neutral-400" />
                      </div>
                    )}
                  </div>

                  <div>
                    <p className="display truncate text-sm font-bold text-neutral-900 transition-colors group-hover:text-pitch">
                      {p.name}
                    </p>
                    {isCombined && (
                      <p className="text-[10px] text-neutral-400">
                        {p.goals}G · {p.assists}A
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="score-display text-base font-bold text-pitch">
                    {p[metricKey]}
                  </span>
                  <span className="label text-[9px] text-neutral-400">
                    {metricSuffix}
                  </span>
                  <ChevronRight className="size-3.5 text-neutral-300 transition-transform group-hover:translate-x-0.5 group-hover:text-pitch" />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
