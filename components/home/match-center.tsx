"use client";

import Image from "next/image";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Link } from "@/app/i18n/navigation";
import {
  Play,
  Footprints,
  Calendar,
  History,
  Video,
  ArrowRight,
  MapPin,
  Clock,
} from "lucide-react";

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
    <div className="space-y-10 sm:space-y-12">

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

      {/* ── 3. Latest Highlights Video ── */}
      {latestVideo?.videoUrl && ytEmbed(latestVideo.videoUrl) && (
        <section className="pt-2">
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
              <div className="flex flex-col justify-between border-t border-neutral-100 p-5 sm:p-6 lg:col-span-4 lg:border-t-0 lg:border-l">
                <div>
                  <span className="label inline-block rounded-full bg-green-50 px-2.5 py-1 text-[10px] font-semibold text-pitch">
                    Highlights
                  </span>
                  <h3 className="display mt-2.5 text-lg text-neutral-900 sm:text-xl">
                    <span className="text-neutral-400">
                      {latestVideo.homeOrAway === "home" ? "vs " : "@ "}
                    </span>
                    {latestVideo.opponent}
                  </h3>
                  <p className="label mt-1 text-neutral-400">
                    {new Date(latestVideo.date).toLocaleDateString(dl, {
                      weekday: "short",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>

                {latestVideo.score && (
                  <div className="mt-5 flex items-center justify-between border-t border-neutral-100 pt-4 sm:mt-6">
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

/* ── Section Sub-Heading ─────────────────────────────────────────────── */

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
    <div className="h-full overflow-hidden rounded-2xl border border-neutral-200/80 bg-white shadow-card">
      {children}
    </div>
  );
}

/* ── Fixture Row (Mobile-Optimized) ──────────────────────────────────── */

function FixtureRow({ match, dl }: { match: Match; dl: string }) {
  const d = new Date(match.date);
  const isHome = match.homeOrAway === "home";
  const monthShort = d
    .toLocaleDateString(dl, { month: "short" })
    .toUpperCase()
    .replace(".", "");

  return (
    <Link
      href={`/partits/${match._id}`}
      className="group flex items-center justify-between gap-3 px-4 py-4 transition-colors duration-fast hover:bg-neutral-50/80 sm:px-6 sm:py-4.5"
    >
      <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4">

        {/* Date block */}
        <div className="flex w-10 shrink-0 flex-col items-center justify-center rounded-xl bg-neutral-50 p-1 text-center sm:w-11 sm:p-1.5 border border-neutral-100">
          <span className="display text-[9px] font-bold text-neutral-400 sm:text-[10px]">
            {monthShort}
          </span>
          <span className="score-display text-lg font-bold leading-none text-neutral-900 sm:text-xl">
            {d.getDate()}
          </span>
        </div>

        {/* Crest */}
        <Crest src={match.opponentCrestUrl} name={match.opponent} />

        {/* Team Names & Metadata */}
        <div className="min-w-0 flex-1">
          <p className="display text-sm font-bold text-neutral-900 transition-colors group-hover:text-pitch sm:text-base line-clamp-2 leading-snug">
            <span className="text-neutral-400 font-normal">
              {isHome ? "vs " : "@ "}
            </span>
            {match.opponent}
          </p>

          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-neutral-500">
            <span className="inline-flex items-center gap-1 capitalize">
              <Clock className="size-3 text-neutral-400" />
              {d.toLocaleTimeString(dl, { hour: "2-digit", minute: "2-digit" })}h
            </span>

            {match.venue && (
              <span className="inline-flex items-center gap-1 truncate">
                <MapPin className="size-3 text-neutral-400" />
                <span className="truncate max-w-[120px] sm:max-w-[200px]">
                  {match.venue}
                </span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Home/Away Pill & Action */}
      <div className="flex shrink-0 items-center gap-2">
        <span
          className={`display rounded-full px-2.5 py-0.5 text-[10px] font-semibold tracking-wider sm:px-3 sm:py-1 sm:text-[11px] ${isHome
            ? "bg-pitch text-white"
            : "bg-neutral-100 text-neutral-600"
            }`}
        >
          {isHome ? "CASA" : "FORA"}
        </span>
        <ArrowRight className="size-3.5 text-neutral-300 transition-transform group-hover:translate-x-0.5 group-hover:text-pitch hidden sm:block" />
      </div>
    </Link>
  );
}

/* ── Result Row (Mobile-Optimized) ───────────────────────────────────── */

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
    <Link
      href={`/partits/${match._id}`}
      className="group flex items-center justify-between gap-3 px-4 py-4 transition-colors duration-fast hover:bg-neutral-50/80 sm:px-6 sm:py-4.5"
    >
      <div className="flex min-w-0 flex-1 items-start gap-3 sm:gap-4">
        {/* Crest */}
        <Crest src={match.opponentCrestUrl} name={match.opponent} />

        {/* Details */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <p className="display text-sm font-bold text-neutral-900 transition-colors group-hover:text-pitch sm:text-base line-clamp-2 leading-snug">
              <span className="text-neutral-400 font-normal">
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

          <p className="mt-1 text-[11px] text-neutral-400 sm:text-xs">
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
                <span key={s.name} className="inline-flex items-center text-[11px] sm:text-xs">
                  {s.name}
                  {s.goals > 1 && (
                    <span className="numeric ml-0.5 font-bold text-pitch">
                      ×{s.goals}
                    </span>
                  )}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Score Display & Arrow */}
      <div className="flex shrink-0 items-center gap-2 sm:gap-3 pl-2">
        <p
          className={`score-display text-lg font-bold sm:text-2xl ${o === "W" ? "text-pitch" : "text-neutral-700"
            }`}
        >
          {line}
        </p>
        <ArrowRight className="size-3.5 text-neutral-300 transition-transform group-hover:translate-x-0.5 group-hover:text-pitch" />
      </div>
    </Link>
  );
}

/* ── Club Crest Badge ────────────────────────────────────────────────── */

function Crest({ src, name }: { src?: string; name: string }) {
  if (src) {
    return (
      <div className="flex size-9 sm:size-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-neutral-100 bg-neutral-50 p-1">
        <Image
          src={src}
          alt={name}
          width={36}
          height={36}
          className="max-h-full max-w-full object-contain"
        />
      </div>
    );
  }
  return (
    <div
      aria-hidden
      className="flex size-9 sm:size-10 shrink-0 items-center justify-center rounded-xl border border-neutral-200 bg-neutral-100 text-xs font-bold text-neutral-500"
    >
      {name.charAt(0)}
    </div>
  );
}

/* ── Empty State ─────────────────────────────────────────────────────── */

function Empty({ text, icon }: { text: string; icon?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-2 px-6 py-12 text-center">
      {icon && (
        <span className="flex size-10 items-center justify-center rounded-full bg-neutral-100">
          {icon}
        </span>
      )}
      <p className="max-w-xs text-xs text-neutral-400">{text}</p>
    </div>
  );
}
