"use client";

import Image from "next/image";
import { Link } from "@/app/i18n/navigation";
import { urlFor } from "@/sanity/lib/image";
import { Calendar, ArrowRight, MapPin } from "lucide-react";

/* ── Types ──────────────────────────────────────────────────────────── */

export type RelatedMatchCardData = {
  _id: string;
  slug?: string;
  date?: string;
  competition?: string;
  matchday?: number;
  homeOrAway?: string;
  venue?: string;
  opponent: string;
  opponentCrest?: unknown;
  opponentCrestUrl?: string; // 👈 Supports both string URL and Sanity image
  score?: { home: number; away: number };
};

export type ArticleCardData = {
  _id: string;
  title: string;
  slug: string;
  coverImage?: unknown;
  publishedAt?: string;
  excerpt?: string;
  relatedMatch?: RelatedMatchCardData;
};

/* ── Safe Crest URL Resolver ────────────────────────────────────────── */

function getCrestUrl(crest: unknown): string | undefined {
  if (!crest) return undefined;
  if (typeof crest === "string") return crest; // Already a URL string
  try {
    return urlFor(crest).width(64).height(64).fit("crop").url();
  } catch {
    return undefined;
  }
}

/* ── Component ──────────────────────────────────────────────────────── */

export function ArticleCard({
  article,
  locale,
}: {
  article: ArticleCardData;
  locale: string;
}) {
  const dl = locale === "ca" ? "ca-ES" : locale === "es" ? "es-ES" : "en-GB";
  const pubDate = article.publishedAt ? new Date(article.publishedAt) : null;

  return (
    <Link
      href={`/noticies/${article.slug}`}
      className="group flex h-full flex-col focus-visible:outline-none"
    >
      <article className="relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-neutral-200/80 bg-white shadow-card transition-all duration-normal ease-out group-hover:-translate-y-1 group-hover:border-pitch/30 group-hover:shadow-card-hover group-focus-visible:ring-2 group-focus-visible:ring-pitch">

        {/* ── Top Cover Area: Image OR Dynamic Match Graphic ── */}
        <div className="relative aspect-16/9 w-full overflow-hidden bg-neutral-100">
          {article.coverImage ? (
            <Image
              src={urlFor(article.coverImage).width(600).height(338).fit("crop").url()}
              alt={article.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="size-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            />
          ) : article.relatedMatch ? (
            /* Match Scoreboard Fallback */
            <CardMatchGraphic
              match={article.relatedMatch}
              locale={locale}
              dl={dl}
            />
          ) : (
            /* Club Brand Graphic Fallback */
            <CardBrandGraphic />
          )}
        </div>

        {/* ── Card Content Body ── */}
        <div className="flex flex-1 flex-col justify-between p-5 sm:p-6">
          <div>
            {/* Meta Row: Date & Match badge */}
            <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2">
              {pubDate && (
                <div className="flex items-center gap-1.5 text-xs text-neutral-400">
                  <Calendar className="size-3.5 text-pitch" />
                  <time dateTime={article.publishedAt}>
                    {pubDate.toLocaleDateString(dl, {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </time>
                </div>
              )}

              {article.relatedMatch && (
                <span className="label rounded-full bg-sand-100 px-2.5 py-0.5 text-[9px] font-bold text-[#9A7D1A]">
                  vs {article.relatedMatch.opponent}
                </span>
              )}
            </div>

            {/* Title */}
            <h3 className="display text-lg font-bold text-neutral-900 transition-colors duration-fast group-hover:text-pitch sm:text-xl line-clamp-2 leading-snug">
              {article.title}
            </h3>

            {/* Excerpt */}
            {article.excerpt && (
              <p className="mt-2 text-sm text-neutral-500 line-clamp-2">
                {article.excerpt}
              </p>
            )}
          </div>

          {/* Read CTA */}
          <div className="mt-5 flex items-center gap-1.5 border-t border-neutral-100 pt-3 text-xs font-bold text-pitch">
            <span className="display tracking-wider">
              {locale === "ca" ? "Llegir notícia" : locale === "es" ? "Leer noticia" : "Read article"}
            </span>
            <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
          </div>
        </div>
      </article>
    </Link>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   Sub-Components for Visual Fallbacks
   ═══════════════════════════════════════════════════════════════════════ */

function CardMatchGraphic({
  match,
  locale,
  dl,
}: {
  match: RelatedMatchCardData;
  locale: string;
  dl: string;
}) {
  const hasScore = match.score?.home !== undefined && match.score?.away !== undefined;

  let outcome: "W" | "D" | "L" | null = null;
  if (hasScore && match.score) {
    outcome =
      match.score.home > match.score.away
        ? "W"
        : match.score.home < match.score.away
          ? "L"
          : "D";
  }

  const outcomeBg =
    outcome === "W"
      ? "bg-result-win text-white"
      : outcome === "D"
        ? "bg-result-draw text-white"
        : "bg-result-loss text-white";

  const outcomeText =
    outcome === "W"
      ? locale === "ca" ? "V" : locale === "es" ? "V" : "W"
      : outcome === "D"
        ? locale === "ca" ? "E" : locale === "es" ? "E" : "D"
        : locale === "ca" ? "D" : locale === "es" ? "D" : "L";

  const isFriendly =
    match.competition === "friendly" ||
    match.competition === "Partido Amistoso";

  // Resolves whether it's opponentCrest (Sanity object) or opponentCrestUrl (string URL)
  const opponentCrestSrc = getCrestUrl(match.opponentCrest || match.opponentCrestUrl);

  return (
    <div className="relative flex size-full flex-col justify-between overflow-hidden bg-linear-to-br from-pitch via-green-800 to-pitch-deep p-3.5 text-white sm:p-4">
      {/* Lawn mowing texture */}
      <div className="mow absolute inset-0 opacity-40" aria-hidden />

      {/* Top Header Tag */}
      <div className="relative z-10 flex items-center justify-between">
        <span className="label rounded-full border border-white/20 bg-neutral-950/50 px-2 py-0.5 text-[9px] font-bold text-sand-200 backdrop-blur-xs">
          {isFriendly
            ? "Amistós"
            : match.matchday
              ? `Jornada ${match.matchday}`
              : "Lliga"}
        </span>

        {outcome && (
          <span
            className={`display rounded-full px-2 py-0.2 text-[9px] font-bold tracking-wider shadow-xs ${outcomeBg}`}
          >
            {outcomeText}
          </span>
        )}
      </div>

      {/* Center Matchup & Logos */}
      <div className="relative z-10 my-1 flex items-center justify-around gap-2">

        {/* Inter Pomar Crest */}
        <div className="flex flex-col items-center">
          <div className="flex size-10 items-center justify-center rounded-md border border-white/20 bg-white p-1.5 shadow-md backdrop-blur-xs transition-transform duration-300 group-hover:scale-105 sm:size-12">
            <Image
              src="/clear_crest.png"
              alt="Inter Pomar"
              width={36}
              height={42}
              className="max-h-full max-w-full object-contain drop-shadow-md"
            />
          </div>
          <span className="display mt-1 text-[10px] font-bold text-white">
            Inter Pomar
          </span>
        </div>

        {/* Scoreboard / VS */}
        <div className="flex flex-col items-center justify-center">
          {hasScore && match.score ? (
            <div className="flex items-center gap-1.5 rounded-lg border border-white/20 bg-neutral-950/70 px-2.5 py-1 shadow-md backdrop-blur-xs">
              <span className="score-display text-lg font-bold text-white sm:text-xl">
                {match.score.home}
              </span>
              <span className="score-display text-xs text-sand-400">–</span>
              <span className="score-display text-lg font-bold text-white sm:text-xl">
                {match.score.away}
              </span>
            </div>
          ) : (
            <div className="flex size-7 items-center justify-center rounded-full border border-white/20 bg-neutral-950/60 shadow-sm backdrop-blur-xs">
              <span className="display text-xs font-bold text-sand-300">VS</span>
            </div>
          )}
        </div>

        {/* Opponent Crest */}
        <div className="flex flex-col items-center">
          <div className="flex size-10 items-center justify-center rounded-md border border-white/20 bg-white p-1.5 shadow-md backdrop-blur-xs transition-transform duration-300 group-hover:scale-105 sm:size-12">
            {opponentCrestSrc ? (
              <Image
                src={opponentCrestSrc}
                alt={match.opponent}
                width={36}
                height={42}
                className="max-h-full max-w-full object-contain drop-shadow-md"
              />
            ) : (
              <div className="flex size-full items-center justify-center rounded-lg bg-neutral-900/40">
                <span className="display text-sm font-bold text-white/70">
                  {match.opponent?.charAt(0) || "R"}
                </span>
              </div>
            )}
          </div>
          <span className="display mt-1 max-w-[70px] truncate text-[10px] font-bold text-white sm:max-w-[85px]">
            {match.opponent}
          </span>
        </div>
      </div>

      {/* Bottom Venue / Date */}
      <div className="relative z-10 flex items-center justify-center text-[10px] text-white/75">
        {match.venue ? (
          <span className="inline-flex items-center gap-1 truncate max-w-[180px]">
            <MapPin className="size-3 text-sand-300 shrink-0" />
            <span className="truncate">{match.venue}</span>
          </span>
        ) : (
          <span className="label text-[9px] tracking-wider text-white/40">
            Camp Municipal de Pomar
          </span>
        )}
      </div>
    </div>
  );
}

function CardBrandGraphic() {
  return (
    <div className="relative flex size-full items-center justify-center bg-linear-to-br from-pitch to-pitch-deep p-4">
      <div className="mow absolute inset-0 opacity-40" aria-hidden />
      <div className="relative z-10 flex flex-col items-center text-center">
        <Image
          src="/clear_crest.png"
          alt="Inter Pomar"
          width={52}
          height={60}
          className="drop-shadow-md transition-transform duration-300 group-hover:scale-105"
        />
        <p className="display mt-2 text-xs font-bold tracking-wider text-white/80 uppercase">
          Inter Pomar CF
        </p>
      </div>
    </div>
  );
}
