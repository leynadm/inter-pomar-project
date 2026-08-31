import Image from "next/image";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { ArrowLeft, Calendar, User, ArrowRight } from "lucide-react";

import { Link } from "@/app/i18n/navigation";
import { client } from "@/sanity/lib/client";
import { urlFor } from "@/sanity/lib/image";
import { ArticleBody } from "@/components/articles/portable-text";

/* ── Data Fetching ──────────────────────────────────────────────────── */

async function getArticle(slug: string) {
  return client.fetch(
    `*[_type == "article" && slug.current == $slug][0] {
      _id,
      title,
      "slug": slug.current,
      coverImage,
      publishedAt,
      body,
      relatedMatch-> {
        _id,
        "slug": slug.current,
        date,
        opponent,
        opponentCrest,
        homeOrAway,
        score,
        matchday,
        competition
      }
    }`,
    { slug },
  );
}

/* ── Page ───────────────────────────────────────────────────────────── */

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const article = await getArticle(slug);
  if (!article) notFound();

  const dl = locale === "ca" ? "ca-ES" : locale === "es" ? "es-ES" : "en-GB";
  const pubDate = article.publishedAt ? new Date(article.publishedAt) : null;

  const match = article.relatedMatch;
  const hasMatchScore = match?.score?.home !== undefined && match?.score?.away !== undefined;

  return (
    <main className="min-h-screen bg-paper pt-24 pb-20 sm:pt-28">

      {/* ── Top Header / Breadcrumbs ── */}
      <div className="mx-auto max-w-4xl px-5 sm:px-8">
        <Link
          href="/noticies"
          className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-1.5 text-xs font-semibold text-neutral-600 shadow-xs transition-colors hover:border-pitch hover:text-pitch"
        >
          <ArrowLeft className="size-3.5" />
          <span className="label">Totes les notícies</span>
        </Link>

        {/* Article Meta */}
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
          <span className="label text-pitch font-bold">Inter Pomar CF</span>
        </div>

        {/* Main Headline */}
        <h1 className="display-hero mt-3 text-3xl font-bold text-neutral-900 sm:text-4xl lg:text-5xl">
          {article.title}
        </h1>
      </div>

      {/* ── Hero Cover Image ── */}
      {article.coverImage && (
        <div className="mx-auto mt-8 max-w-5xl px-5 sm:px-8">
          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-3xl border border-neutral-200/80 bg-neutral-100 shadow-card">
            <Image
              src={urlFor(article.coverImage).width(1400).height(788).fit("crop").url()}
              alt={article.title}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 1200px"
              className="size-full object-cover"
            />
          </div>
        </div>
      )}

      {/* ── Main Article Body Area ── */}
      <div className="mx-auto mt-10 max-w-3xl px-5 sm:px-8">

        {/* Linked Match Summary Card (if article is a Match Report) */}
        {match && (
          <div className="mb-10 overflow-hidden rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-card">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Image
                  src="/solid_crest.png"
                  alt="Inter Pomar"
                  width={32}
                  height={38}
                  className="size-8 object-contain"
                />
                <div>
                  <span className="label text-[10px] text-neutral-400">
                    {match.competition === "friendly" ? "Partit Amistós" : `Jornada ${match.matchday ?? ""}`}
                  </span>
                  <p className="display text-base font-bold text-neutral-900">
                    Inter Pomar vs {match.opponent}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {hasMatchScore && (
                  <span className="score-display text-xl font-bold text-pitch sm:text-2xl">
                    {match.score.home} – {match.score.away}
                  </span>
                )}
                <Link
                  href={`/partits/${match.slug || match._id}`}
                  className="display inline-flex items-center gap-1 rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-pitch transition-colors hover:bg-green-100"
                >
                  Veure partit
                  <ArrowRight className="size-3" />
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Editorial Portable Text Content */}
        <article className="prose prose-neutral max-w-none">
          <ArticleBody value={article.body} />
        </article>

      </div>
    </main>
  );
}
