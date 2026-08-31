"use client";

import Image from "next/image";
import { Link } from "@/app/i18n/navigation";
import { urlFor } from "@/sanity/lib/image";
import { Calendar, ArrowRight } from "lucide-react";

export type ArticleCardData = {
  _id: string;
  title: string;
  slug: string;
  coverImage?: unknown;
  publishedAt?: string;
  excerpt?: string;
  relatedMatch?: {
    _id: string;
    slug?: string;
    opponent: string;
    score?: { home: number; away: number };
  };
};

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

        {/* ── Top Cover Image / Fallback Banner ── */}
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-neutral-100">
          {article.coverImage ? (
            <Image
              src={urlFor(article.coverImage).width(600).height(338).fit("crop").url()}
              alt={article.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="size-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            />
          ) : (
            <div className="flex size-full items-center justify-center bg-linear-to-br from-pitch to-pitch-deep">
              <div className="mow absolute inset-0 opacity-40" aria-hidden />
              <Image
                src="/solid_crest.png"
                alt=""
                width={56}
                height={64}
                className="opacity-40"
              />
            </div>
          )}

          {/* Related match badge overlay */}
          {article.relatedMatch && (
            <span className="label absolute top-3 left-3 rounded-full bg-neutral-950/70 px-3 py-1 text-[10px] font-bold text-sand-300 backdrop-blur-md">
              vs {article.relatedMatch.opponent}
            </span>
          )}
        </div>

        {/* ── Body Details ── */}
        <div className="flex flex-1 flex-col justify-between p-5 sm:p-6">
          <div>
            {/* Meta row */}
            {pubDate && (
              <div className="mb-2 flex items-center gap-1.5 text-xs text-neutral-400">
                <Calendar className="size-3.5" />
                <time dateTime={article.publishedAt}>
                  {pubDate.toLocaleDateString(dl, {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </time>
              </div>
            )}

            {/* Title */}
            <h3 className="display text-lg font-bold text-neutral-900 transition-colors duration-fast group-hover:text-pitch sm:text-xl line-clamp-2 leading-snug">
              {article.title}
            </h3>

            {/* Excerpt (if available) */}
            {article.excerpt && (
              <p className="mt-2 text-sm text-neutral-500 line-clamp-2">
                {article.excerpt}
              </p>
            )}
          </div>

          {/* Read CTA */}
          <div className="mt-4 flex items-center gap-1.5 border-t border-neutral-100 pt-3 text-xs font-bold text-pitch">
            <span className="display tracking-wider">Llegir notícia</span>
            <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
          </div>
        </div>
      </article>
    </Link>
  );
}
