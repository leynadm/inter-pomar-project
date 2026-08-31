import Image from "next/image";
import { getTranslations } from "next-intl/server";
import {
  Newspaper,
  Calendar,
  ArrowRight,
  MapPin,
  Clock,
} from "lucide-react";

import { Link } from "@/app/i18n/navigation";
import { client } from "@/sanity/lib/client";
import { urlFor } from "@/sanity/lib/image";
import { ArticleCard, type ArticleCardData } from "@/components/articles/article-card";

/* ── Data Fetching ──────────────────────────────────────────────────── */

async function getAllArticles(): Promise<ArticleCardData[]> {
  return client.fetch(
    `*[_type == "article"] | order(publishedAt desc) {
      _id,
      title,
      "slug": slug.current,
      coverImage,
      publishedAt,
      relatedMatch-> {
        _id,
        "slug": slug.current,
        date,
        competition,
        matchday,
        homeOrAway,
        venue,
        opponent,
        opponentCrest,
        score
      }
    }`,
  );
}

/* ── Page ───────────────────────────────────────────────────────────── */

export default async function NewsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("navigation");
  const articles = await getAllArticles();
  const dl = locale === "ca" ? "ca-ES" : locale === "es" ? "es-ES" : "en-GB";

  const featured = articles[0];
  const restArticles = articles.slice(1);

  const labels = {
    badge:
      locale === "ca"
        ? "Actualitat del Club"
        : locale === "es"
          ? "Actualidad del Club"
          : "Club News",
    title:
      t("news") ??
      (locale === "ca"
        ? "Notícies i Cròniques"
        : locale === "es"
          ? "Noticias y Crónicas"
          : "News & Reports"),
    subtitle:
      locale === "ca"
        ? "Tota l'actualitat, cròniques de partits i comunicats oficials de l'Inter Pomar."
        : locale === "es"
          ? "Toda la actualidad, crónicas de partidos y comunicados oficiales del Inter Pomar."
          : "All the latest news, match reports, and official announcements from Inter Pomar.",
    featuredBadge:
      locale === "ca"
        ? "Destacat"
        : locale === "es"
          ? "Destacado"
          : "Featured",
    matchReportBadge:
      locale === "ca"
        ? "Crònica de Partit"
        : locale === "es"
          ? "Crónica de Partido"
          : "Match Report",
    readArticle:
      locale === "ca"
        ? "Llegir crònica"
        : locale === "es"
          ? "Leer crónica"
          : "Read article",
    noArticles:
      locale === "ca"
        ? "Encara no hi ha cap notícia publicada."
        : locale === "es"
          ? "Aún no hay ninguna noticia publicada."
          : "No articles published yet.",
  };

  return (
    <main className="min-h-screen bg-paper pt-24 pb-20 sm:pt-28">

      {/* ── Page Header ── */}
      <div className="border-b border-neutral-200/80 bg-white">
        <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-12">
          <div className="mb-2 flex items-center gap-2 text-pitch">
            <Newspaper className="size-5" />
            <span className="label font-bold text-pitch">{labels.badge}</span>
          </div>
          <h1 className="display-hero text-3xl text-neutral-900 sm:text-4xl lg:text-5xl">
            {labels.title}
          </h1>
          <p className="mt-2 max-w-xl text-sm text-neutral-500">
            {labels.subtitle}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-6xl space-y-12 px-5 py-8 sm:px-8 sm:py-12">
        {articles.length === 0 ? (
          <div className="rounded-2xl border border-neutral-200/80 bg-white p-12 text-center text-sm text-neutral-400 shadow-card">
            {labels.noArticles}
          </div>
        ) : (
          <>
            {/* ── 1. Featured Top Article ── */}
            {featured && (
              <section>
                <Link
                  href={`/noticies/${featured.slug}`}
                  className="group block focus-visible:outline-none"
                >
                  <article className="overflow-hidden rounded-3xl border border-neutral-200/80 bg-white shadow-card transition-all duration-normal ease-out group-hover:-translate-y-1 group-hover:border-pitch/30 group-hover:shadow-card-hover">
                    <div className="grid grid-cols-1 lg:grid-cols-12">

                      {/* Left: Cover Image OR Dynamic Match Scoreboard Graphic */}
                      <div className="relative aspect-16/10 w-full overflow-hidden bg-neutral-100 lg:col-span-7 lg:aspect-auto">
                        {featured.coverImage ? (
                          <Image
                            src={urlFor(featured.coverImage).width(1000).height(650).fit("crop").url()}
                            alt={featured.title}
                            fill
                            priority
                            sizes="(max-width: 1024px) 100vw, 60vw"
                            className="size-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                          />
                        ) : featured.relatedMatch ? (
                          /* Match Graphic Fallback */
                          <MatchBannerGraphic
                            match={featured.relatedMatch}
                            locale={locale}
                            dl={dl}
                          />
                        ) : (
                          /* Brand Editorial Fallback */
                          <ClubBrandGraphic />
                        )}
                      </div>

                      {/* Right: Content Panel */}
                      <div className="flex flex-col justify-between p-6 sm:p-8 lg:col-span-5 lg:p-10">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="label rounded-full border border-green-200/60 bg-green-50 px-3 py-1 text-[10px] font-bold text-pitch">
                              {labels.featuredBadge}
                            </span>

                            {featured.relatedMatch && (
                              <span className="label rounded-full bg-sand-100 px-3 py-1 text-[10px] font-bold text-[#9A7D1A]">
                                {labels.matchReportBadge}
                              </span>
                            )}
                          </div>

                          {featured.publishedAt && (
                            <p className="mt-4 flex items-center gap-1.5 text-xs text-neutral-400">
                              <Calendar className="size-3.5 text-pitch" />
                              <time dateTime={featured.publishedAt}>
                                {new Date(featured.publishedAt).toLocaleDateString(dl, {
                                  day: "numeric",
                                  month: "long",
                                  year: "numeric",
                                })}
                              </time>
                            </p>
                          )}

                          <h2 className="display mt-2.5 text-2xl font-bold text-neutral-900 transition-colors duration-fast group-hover:text-pitch sm:text-3xl line-clamp-3">
                            {featured.title}
                          </h2>
                        </div>

                        <div className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-pitch">
                          <span className="display tracking-wider">{labels.readArticle}</span>
                          <ArrowRight className="size-4 transition-transform group-hover:translate-x-1.5" />
                        </div>
                      </div>

                    </div>
                  </article>
                </Link>
              </section>
            )}

            {/* ── 2. Grid of Remaining Articles ── */}
            {restArticles.length > 0 && (
              <section className="pt-4">
                <div className="mb-6 flex items-center gap-2.5 border-b border-neutral-200/80 pb-3">
                  <span className="h-5 w-1 shrink-0 rounded-sm bg-pitch" aria-hidden />
                  <h2 className="display text-xl font-bold text-neutral-900">
                    Més Notícies
                  </h2>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {restArticles.map((art) => (
                    <ArticleCard key={art._id} article={art} locale={locale} />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </main>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   Dynamic Match Scoreboard Graphic (Replaces the empty green square)
   ═══════════════════════════════════════════════════════════════════════ */

function MatchBannerGraphic({
  match,
  locale,
  dl,
}: {
  match: any;
  locale: string;
  dl: string;
}) {
  const isInterHome = match.homeOrAway === "home";
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
      ? locale === "ca" ? "Victòria" : locale === "es" ? "Victoria" : "Win"
      : outcome === "D"
        ? locale === "ca" ? "Empat" : locale === "es" ? "Empate" : "Draw"
        : locale === "ca" ? "Derrota" : locale === "es" ? "Derrota" : "Loss";

  const isFriendly =
    match.competition === "friendly" ||
    match.competition === "Partido Amistoso";

  const matchDate = match.date ? new Date(match.date) : null;

  return (
    <div className="relative flex size-full min-h-64 flex-col justify-between overflow-hidden bg-linear-to-br from-pitch via-green-800 to-pitch-deep p-6 text-white sm:min-h-80 sm:p-8">
      {/* Lawn mowing stripes texture */}
      <div className="mow absolute inset-0 opacity-40" aria-hidden />

      {/* Top Meta Bar */}
      <div className="relative z-10 flex items-center justify-between gap-2">
        <span className="label rounded-full border border-white/20 bg-neutral-950/40 px-3 py-1 text-[10px] font-bold text-sand-200 backdrop-blur-md">
          {isFriendly
            ? "Partit Amistós"
            : match.matchday
              ? `Jornada ${match.matchday}`
              : "Lliga Sènior"}
        </span>

        {matchDate && (
          <span className="flex items-center gap-1 text-xs text-white/80">
            <Calendar className="size-3.5 text-sand-300" />
            <span>
              {matchDate.toLocaleDateString(dl, {
                day: "numeric",
                month: "short",
              })}
            </span>
          </span>
        )}
      </div>

      {/* Center Scoreboard Matchup */}
      <div className="relative z-10 my-4 flex items-center justify-around gap-4">

        {/* Inter Pomar */}
        <div className="flex flex-col items-center text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl border border-white/20 bg-white p-2 shadow-xl backdrop-blur-md transition-transform duration-300 group-hover:scale-105 sm:size-18">
            <Image
              src="/clear_crest.png"
              alt="Inter Pomar"
              width={52}
              height={60}
              className="max-h-full max-w-full object-contain drop-shadow-md"
            />
          </div>
          <span className="display mt-2 text-xs font-bold text-white sm:text-sm">
            Inter Pomar
          </span>
        </div>

        {/* Score Display / VS */}
        <div className="flex flex-col items-center justify-center">
          {hasScore ? (
            <div className="flex flex-col items-center gap-1.5">
              <div className="flex items-center gap-2 rounded-xl border border-white/20 bg-neutral-950/70 px-4 py-2 shadow-xl backdrop-blur-md">
                <span className="score-display text-2xl font-bold text-white sm:text-3xl">
                  {match.score.home}
                </span>
                <span className="score-display text-base text-sand-400 sm:text-lg">
                  –
                </span>
                <span className="score-display text-2xl font-bold text-white sm:text-3xl">
                  {match.score.away}
                </span>
              </div>

              {outcome && (
                <span
                  className={`display rounded-full px-2.5 py-0.2 text-[9px] font-bold tracking-widest ${outcomeBg}`}
                >
                  {outcomeText}
                </span>
              )}
            </div>
          ) : (
            <div className="flex size-11 items-center justify-center rounded-full border border-white/20 bg-neutral-950/60 shadow-lg backdrop-blur-md">
              <span className="display text-sm font-bold text-sand-300">VS</span>
            </div>
          )}
        </div>

        {/* Opponent */}
        <div className="flex flex-col items-center text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl border border-white/20 bg-white p-2 shadow-xl backdrop-blur-md transition-transform duration-300 group-hover:scale-105 sm:size-18">
            {match.opponentCrest ? (
              <Image
                src={urlFor(match.opponentCrest).width(60).height(60).fit("crop").url()}
                alt={match.opponent}
                width={52}
                height={60}
                className="max-h-full max-w-full object-contain drop-shadow-md"
              />
            ) : (
              <div className="flex size-full items-center justify-center rounded-xl bg-neutral-900/40">
                <span className="display text-xl font-bold text-white/60 sm:text-2xl">
                  {match.opponent?.charAt(0) || "R"}
                </span>
              </div>
            )}
          </div>
          <span className="display mt-2 max-w-[90px] truncate text-xs font-bold text-white sm:max-w-[120px] sm:text-sm">
            {match.opponent}
          </span>
        </div>

      </div>

      {/* Bottom Row: Venue / Location */}
      <div className="relative z-10 flex items-center justify-center text-xs text-white/75">
        {match.venue ? (
          <span className="inline-flex items-center gap-1.5 truncate">
            <MapPin className="size-3.5 text-sand-300 shrink-0" />
            <span className="truncate">{match.venue}</span>
          </span>
        ) : (
          <span className="label text-[10px] tracking-widest text-white/40">
            Camp Municipal de Pomar
          </span>
        )}
      </div>
    </div>
  );
}

/* ── Fallback Graphic (When neither cover image nor match is present) ── */

function ClubBrandGraphic() {
  return (
    <div className="relative flex size-full min-h-64 items-center justify-center bg-linear-to-br from-pitch to-pitch-deep p-6">
      <div className="mow absolute inset-0 opacity-40" aria-hidden />
      <div className="relative z-10 flex flex-col items-center text-center">
        <Image
          src="/clear_crest.png"
          alt="Inter Pomar"
          width={72}
          height={84}
          className="drop-shadow-lg transition-transform duration-300 group-hover:scale-105"
        />
        <p className="display mt-3 text-sm font-bold tracking-widest text-white/80 uppercase">
          Inter Pomar CF
        </p>
      </div>
    </div>
  );
}
