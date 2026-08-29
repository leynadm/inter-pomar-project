"use client";

import Image from "next/image";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Play, Footprints, Calendar, History, Video } from "lucide-react";

type Score = { home: number; away: number };

export type Match = {
  _id: string;
  date: string;
  opponent: string;
  opponentCrestUrl?: string;
  homeOrAway: string;
  venue?: string;
  matchday?: number;
  score?: Score;
  outcome?: "W" | "D" | "L";
  scorers?: { name: string; goals: number }[];
  videoUrl?: string;
};

export type MatchCenterCopy = {
  fixtures: string;
  results: string;
  video: string;
  noFixtures: string;
  noResults: string;
  noVideo: string;
  matchdayShort: string;
  win: string;
  draw: string;
  loss: string;
};

function outcomeOf(score: Score) {
  return score.home > score.away ? "W" : score.home < score.away ? "L" : "D";
}

function ytEmbed(url: string) {
  const m = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([^&?/]+)/,
  );
  return m ? `https://www.youtube-nocookie.com/embed/${m[1]}` : null;
}

export function MatchCenter({
  fixtures,
  results,
  latestVideo,
  copy,
  locale,
}: {
  fixtures: Match[];
  results: Match[];
  latestVideo?: Match;
  copy: MatchCenterCopy;
  locale: string;
}) {
  const dl = locale === "ca" ? "ca-ES" : locale === "es" ? "es-ES" : "en-GB";

  return (
    <div className="space-y-12">
      {/* ── 2-Column Grid: Fixtures & Recent Results ── */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">

        {/* 1. Upcoming Fixtures Column */}
        <section className="flex flex-col">
          <SectionSubHead
            title={copy.fixtures}
            icon={<Calendar className="size-4 text-pitch" />}
          />
          <Panel>
            {fixtures.length === 0 ? (
              <Empty text={copy.noFixtures} />
            ) : (
              fixtures.map((m, i) => (
                <div
                  key={m._id}
                  className={i > 0 ? "border-t border-neutral-100" : ""}
                >
                  <FixtureRow match={m} dl={dl} />
                </div>
              ))
            )}
          </Panel>
        </section>

        {/* 2. Recent Results Column */}
        <section className="flex flex-col">
          <SectionSubHead
            title={copy.results}
            icon={<History className="size-4 text-pitch" />}
          />
          <Panel>
            {results.length === 0 ? (
              <Empty text={copy.noResults} />
            ) : (
              results.map((m, i) => (
                <div
                  key={m._id}
                  className={i > 0 ? "border-t border-neutral-100" : ""}
                >
                  <ResultRow match={m} copy={copy} dl={dl} />
                </div>
              ))
            )}
          </Panel>
        </section>
      </div>

      {/* ── 3. Latest Highlights Video (Rendered below if available) ── */}
      {latestVideo?.videoUrl && ytEmbed(latestVideo.videoUrl) && (
        <section className="pt-4">
          <SectionSubHead
            title={copy.video}
            icon={<Video className="size-4 text-pitch" />}
          />
          <Panel>
            <div className="grid grid-cols-1 overflow-hidden lg:grid-cols-12">
              <div className="lg:col-span-8">
                <AspectRatio ratio={16 / 9}>
                  <iframe
                    src={ytEmbed(latestVideo.videoUrl)!}
                    title={`Inter Pomar vs ${latestVideo.opponent}`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="size-full"
                  />
                </AspectRatio>
              </div>

              {/* Video Match Details Sidebar */}
              <div className="flex flex-col justify-between border-t border-neutral-100 p-6 lg:col-span-4 lg:border-t-0 lg:border-l">
                <div>
                  <span className="label inline-block rounded-full bg-green-50 px-2.5 py-1 text-[10px] font-semibold text-pitch">
                    Highlights
                  </span>
                  <h3 className="display mt-3 text-xl text-neutral-900">
                    <span className="text-neutral-400">
                      {latestVideo.homeOrAway === "home" ? "vs " : "@ "}
                    </span>
                    {latestVideo.opponent}
                  </h3>
                  <p className="label mt-1 text-neutral-400">
                    {new Date(latestVideo.date).toLocaleDateString(dl, {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>

                {latestVideo.score && (
                  <div className="mt-6 flex items-center justify-between border-t border-neutral-100 pt-4">
                    <span className="label text-neutral-500">Resultat</span>
                    <span className="score-display text-2xl font-bold text-pitch">
                      {latestVideo.homeOrAway === "home"
                        ? `${latestVideo.score.home} – ${latestVideo.score.away}`
                        : `${latestVideo.score.away} – ${latestVideo.score.home}`}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </Panel>
        </section>
      )}
    </div>
  );
}

/* ── Section Sub-Heading (Design System Section 4i) ───────────────────── */

function SectionSubHead({
  title,
  icon,
}: {
  title: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="mb-3.5 flex items-center gap-2.5">
      <span className="h-5 w-1 shrink-0 rounded-sm bg-pitch" aria-hidden />
      <h3 className="display flex items-center gap-2 text-lg text-neutral-800 sm:text-xl">
        {icon}
        {title}
      </h3>
    </div>
  );
}

/* ── Panel Card Wrapper ──────────────────────────────────────────────── */

function Panel({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-full overflow-hidden rounded-2xl border border-neutral-200/70 bg-white shadow-card">
      {children}
    </div>
  );
}

/* ── Fixture Row ─────────────────────────────────────────────────────── */

function FixtureRow({ match, dl }: { match: Match; dl: string }) {
  const d = new Date(match.date);
  const isHome = match.homeOrAway === "home";
  const monthShort = d
    .toLocaleDateString(dl, { month: "short" })
    .toUpperCase()
    .replace(".", "");

  return (
    <div className="flex items-center justify-between gap-3 px-5 py-4 transition-colors duration-fast hover:bg-neutral-50/80 sm:px-6">
      <div className="flex items-center gap-3.5">
        {/* Date block */}
        <div className="w-11 shrink-0 text-center">
          <p className="display text-[10px] font-semibold text-neutral-400">
            {monthShort}
          </p>
          <p className="score-display text-xl font-bold leading-none text-neutral-800">
            {d.getDate()}
          </p>
        </div>

        <div className="h-8 w-px bg-neutral-200" aria-hidden />

        <Crest src={match.opponentCrestUrl} name={match.opponent} />

        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-neutral-900">
            {isHome
              ? `Inter Pomar vs ${match.opponent}`
              : `${match.opponent} vs Inter Pomar`}
          </p>
          <p className="mt-0.5 truncate text-xs text-neutral-500">
            <span className="capitalize">{d.toLocaleDateString(dl, { weekday: "short" })}</span>
            {" · "}
            {d.toLocaleTimeString(dl, { hour: "2-digit", minute: "2-digit" })}h
            {match.venue ? ` · ${match.venue}` : ""}
          </p>
        </div>
      </div>

      <span
        className={`display shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-semibold tracking-wider ${isHome
            ? "bg-pitch text-white"
            : "bg-neutral-100 text-neutral-600"
          }`}
      >
        {isHome ? "CASA" : "FORA"}
      </span>
    </div>
  );
}

/* ── Result Row ──────────────────────────────────────────────────────── */

function ResultRow({
  match,
  copy,
  dl,
}: {
  match: Match;
  copy: MatchCenterCopy;
  dl: string;
}) {
  if (!match.score) return null;
  const o = match.outcome ?? outcomeOf(match.score);
  const isHome = match.homeOrAway === "home";

  const line = isHome
    ? `${match.score.home} – ${match.score.away}`
    : `${match.score.away} – ${match.score.home}`;

  const outcomeBg =
    o === "W"
      ? "bg-green-50 text-pitch border border-green-200"
      : o === "D"
        ? "bg-sand-100 text-[#9A7D1A] border border-sand-200"
        : "bg-red-50 text-result-loss border border-red-200";

  const outcomeLabel =
    o === "W" ? copy.win : o === "D" ? copy.draw : copy.loss;

  return (
    <div className="flex items-start justify-between gap-3 px-5 py-4 transition-colors duration-fast hover:bg-neutral-50/80 sm:px-6">
      <div className="flex items-start gap-3.5">
        <Crest src={match.opponentCrestUrl} name={match.opponent} />

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate text-sm font-semibold text-neutral-900">
              <span className="text-neutral-400">
                {isHome ? "vs " : "@ "}
              </span>
              {match.opponent}
            </p>
            <span
              className={`display rounded-full px-2 py-0.5 text-[9px] font-semibold tracking-wider ${outcomeBg}`}
            >
              {outcomeLabel}
            </span>
          </div>

          <p className="mt-0.5 text-xs text-neutral-500">
            {new Date(match.date).toLocaleDateString(dl, {
              day: "numeric",
              month: "short",
            })}
            {match.matchday ? ` · ${copy.matchdayShort} ${match.matchday}` : ""}
          </p>

          {/* Goalscorers */}
          {match.scorers && match.scorers.length > 0 && (
            <div className="mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-neutral-600">
              <Footprints className="size-3 shrink-0 text-pitch" aria-hidden />
              {match.scorers.map((s) => (
                <span key={s.name} className="inline-flex items-center">
                  {s.name}
                  {s.goals > 1 && (
                    <span className="numeric ml-0.5 font-semibold text-pitch">
                      ×{s.goals}
                    </span>
                  )}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <p
        className={`score-display shrink-0 text-xl font-bold sm:text-2xl ${o === "W" ? "text-pitch" : "text-neutral-700"
          }`}
      >
        {line}
      </p>
    </div>
  );
}

/* ── Crest ───────────────────────────────────────────────────────────── */

function Crest({ src, name }: { src?: string; name: string }) {
  if (src) {
    return (
      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-neutral-100 bg-neutral-50 p-1">
        <Image
          src={src}
          alt={name}
          width={32}
          height={32}
          className="max-h-full max-w-full object-contain"
        />
      </div>
    );
  }
  return (
    <div
      aria-hidden
      className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-neutral-200 bg-neutral-100 text-xs font-bold text-neutral-500"
    >
      {name.charAt(0)}
    </div>
  );
}

/* ── Empty State ─────────────────────────────────────────────────────── */

function Empty({ text, icon }: { text: string; icon?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-2 px-6 py-12 text-center">
      {icon && <span className="text-neutral-300">{icon}</span>}
      <p className="max-w-xs text-xs text-neutral-400">{text}</p>
    </div>
  );
}
