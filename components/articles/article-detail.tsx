"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Calendar,
  ArrowLeft,
  Share2,
  Check,
  ArrowRight,
  Play,
  MapPin,
} from "lucide-react";
import { Link } from "@/app/i18n/navigation";
import { urlFor } from "@/sanity/lib/image";
import { ArticleBody } from "@/components/articles/portable-text";
import { AspectRatio } from "@/components/ui/aspect-ratio";

/* ── Types ──────────────────────────────────────────────────────────── */

export type RelatedMatchData = {
  _id: string;
  slug?: string;
  date?: string;
  opponent: string;
  opponentCrest?: unknown;
  homeOrAway?: string;
  competition?: string;
  matchday?: number;
  venue?: string;
  score?: { home: number; away: number };
  highlightsVideoUrl?: string;
  matchVideoUrl?: string;
};

export type FullArticle = {
  _id: string;
  title: string;
  slug: string;
  coverImage?: unknown;
  publishedAt?: string;
  body: any;
  relatedMatch?: RelatedMatchData;
};

/* ── Helpers ────────────────────────────────────────────────────────── */

function getYouTubeId(url?: string): string | null {
  if (!url) return null;
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([^&?/]+)/,
  );
  return match ? match[1] : null;
}

export function ArticleDetail({
  article,
  locale,
  backHref = "/noticies",
  backLabel,
}: {
  article: FullArticle;
  locale: string;
  backHref?: "/noticies" | "/partits" | "/";
  backLabel?: string;
}) {
  const [copied, setCopied] = useState(false);
  const dl = locale === "ca" ? "ca-ES" : locale === "es" ? "es-ES" : "en-GB";
  const pubDate = article.publishedAt ? new Date(article.publishedAt) : null;

  const match = article.relatedMatch;
  const hasScore = match?.score?.home !== undefined && match?.score?.away !== undefined;

  let outcome: "W" | "D" | "L" | null = null;
  if (hasScore && match?.score) {
    outcome =
      match.score.home > match.score.away
        ? "W"
        : match.score.home < match.score.away
          ? "L"
          : "D";
  }

  const isInterHome = match?.homeOrAway === "home";
  const videoUrl = match?.highlightsVideoUrl || match?.matchVideoUrl;
  const ytId = getYouTubeId(videoUrl);

  function handleShare() {
    if (typeof window === "undefined") return;
    if (navigator.share) {
      navigator
        .share({
          title: article.title,
          url: window.location.href,
        })
        .catch(() => { });
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div className="w-full">
      {/* ── 1. Header & Breadcrumbs ── */}
      <div className="mx-auto max-w-4xl px-5 sm:px-8">

        {/* Navigation & Share Bar */}
        <div className="flex items-center justify-between gap-4">
          <Link
            href={backHref}
            className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-1.5 text-xs font-semibold text-neutral-600 shadow-xs transition-colors hover:border-pitch hover:text-pitch"
          >
            <ArrowLeft className="size-3.5" />
            <span className="label">
              {backLabel ??
                (locale === "ca"
                  ? "Totes les notícies"
                  : locale === "es"
                    ? "Todas las noticias"
                    : "All news")}
            </span>
          </Link>

          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-neutral-600 shadow-xs transition-colors hover:border-pitch hover:text-pitch"
            aria-label="Share article"
          >
            {copied ? (
              <>
                <Check className="size-3.5 text-pitch" />
                <span className="label text-pitch">Copiat!</span>
              </>
            ) : (
              <>
                <Share2 className="size-3.5" />
                <span className="label">Compartir</span>
              </>
            )}
          </button>
        </div>

        {/* Publication Meta */}
        <div className="mt-6 flex flex-wrap items-center gap-3 text-xs text-neutral-400">
          {pubDate && (
            <span className="flex items-center gap-1.5">
              <Calendar className="size-3.5 text-pitch" />
              <time dateTime={article.publishedAt}>
                {pubDate.toLocaleDateString(dl, {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </time>
            </span>
          )}
          <span>·</span>
          <span className="label font-bold text-pitch">Inter Pomar CF</span>
          {match && (
            <>
              <span>·</span>
              <span className="label text-sand-500 font-bold">
                vs {match.opponent}
              </span>
            </>
          )}
        </div>

        {/* Article Headline */}
        <h1 className="display-hero mt-3 text-3xl font-bold text-neutral-900 sm:text-4xl lg:text-5xl">
          {article.title}
        </h1>
      </div>

      {/* ── 2. Hero Cover / Video Embed Area ── */}
      <div className="mx-auto mt-8 max-w-5xl px-5 sm:px-8">
        {article.coverImage ? (
          <div className="relative aspect-16/9 w-full overflow-hidden rounded-3xl border border-neutral-200/80 bg-neutral-100 shadow-card">
            <Image
              src={urlFor(article.coverImage).width(1400).height(788).fit("crop").url()}
              alt={article.title}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 1200px"
              className="size-full object-cover"
            />
          </div>
        ) : ytId ? (
          /* Embed YouTube highlights video directly if there's no photo */
          <div className="overflow-hidden rounded-3xl border border-neutral-200/80 bg-neutral-900 shadow-card">
            <AspectRatio ratio={16 / 9}>
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${ytId}`}
                title={article.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="size-full"
              />
            </AspectRatio>
          </div>
        ) : null}
      </div>

      {/* ── 3. Content Body & Linked Match Scoreboard ── */}
      <div className="mx-auto mt-10 max-w-3xl px-5 sm:px-8">

        {/* Linked Match Card (With Opponent Crest & Score) */}
        {match && (
          <div className="mb-10 overflow-hidden rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-card">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

              {/* Teams & Crests */}
              <div className="flex items-center gap-3.5">
                {/* Inter Pomar Crest */}
                <Image
                  src="/solid_crest.png"
                  alt="Inter Pomar"
                  width={34}
                  height={40}
                  className="size-9 shrink-0 object-contain"
                />

                <span className="display text-xs text-neutral-300 font-bold">VS</span>

                {/* Opponent Crest */}
                {match.opponentCrest ? (
                  <div className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-neutral-200 bg-neutral-50 p-0.5">
                    <Image
                      src={urlFor(match.opponentCrest).width(40).height(40).fit("crop").url()}
                      alt={match.opponent}
                      width={32}
                      height={32}
                      className="size-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-xs font-bold text-neutral-400">
                    {match.opponent.charAt(0)}
                  </div>
                )}

                {/* Match Info */}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="label text-[10px] text-neutral-400">
                      {match.competition === "friendly"
                        ? "Amistós"
                        : `Jornada ${match.matchday ?? ""}`}
                    </span>
                    {outcome && (
                      <span
                        className={`display rounded-full px-2 py-0.2 text-[9px] font-bold ${outcome === "W"
                          ? "bg-green-50 text-pitch"
                          : outcome === "D"
                            ? "bg-sand-100 text-[#9A7D1A]"
                            : "bg-red-50 text-result-loss"
                          }`}
                      >
                        {outcome === "W" ? "Victòria" : outcome === "D" ? "Empat" : "Derrota"}
                      </span>
                    )}
                  </div>
                  <p className="display text-base font-bold text-neutral-900">
                    {isInterHome
                      ? `Inter Pomar vs ${match.opponent}`
                      : `${match.opponent} vs Inter Pomar`}
                  </p>
                </div>
              </div>

              {/* Score & Action Button */}
              <div className="flex items-center justify-between gap-3 border-t border-neutral-100 pt-3 sm:border-t-0 sm:pt-0">
                {hasScore && (
                  <span className="score-display text-2xl font-bold text-pitch">
                    {isInterHome
                      ? `${match.score?.home} – ${match.score?.away}`
                      : `${match.score?.away} – ${match.score?.home}`}
                  </span>
                )}

                <Link
                  href={`/partits/${match.slug || match._id}`}
                  className="display inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3.5 py-1.5 text-xs font-semibold text-pitch transition-colors hover:bg-green-100"
                >
                  Veure partit
                  <ArrowRight className="size-3.5" />
                </Link>
              </div>

            </div>
          </div>
        )}

        {/* Editorial Portable Text */}
        <div className="prose prose-neutral max-w-none">
          <ArticleBody value={article.body} />
        </div>

      </div>
    </div>
  );
}
