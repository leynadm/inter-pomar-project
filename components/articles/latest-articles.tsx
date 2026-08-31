"use client";

import { Newspaper, ArrowRight } from "lucide-react";
import { Link } from "@/app/i18n/navigation";
import { ArticleCard, type ArticleCardData } from "@/components/articles/article-card";

export type LatestArticlesCopy = {
  title?: string;
  subtitle?: string;
  all?: string;
  noArticles?: string;
};

export function LatestArticles({
  articles,
  locale,
  copy = {},
}: {
  articles: ArticleCardData[];
  locale: string;
  copy?: LatestArticlesCopy;
}) {
  if (articles.length === 0) return null;

  const labels = {
    title: copy.title ?? "Últimes Notícies",
    all: copy.all ?? "Veure totes",
  };

  return (
    <div className="space-y-6">
      {/* Grid of Articles */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {articles.map((article) => (
          <ArticleCard key={article._id} article={article} locale={locale} />
        ))}
      </div>
    </div>
  );
}
