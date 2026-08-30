import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { client } from "@/sanity/lib/client";
import { urlFor } from "@/sanity/lib/image";
import { Link } from "@/app/i18n/navigation";
import { ArrowRight, Footprints } from "lucide-react";

/* ── Types ──────────────────────────────────────────────────────────── */

type Score = { home: number; away: number };
type Outcome = "W" | "D" | "L";

type MatchRow = {
  _id: string;
  date: string;
  opponent: string;
  opponentCrestUrl?: string;
  homeOrAway: string;
  venue?: string;
  matchday?: number;
  score?: Score;
  outcome?: Outcome;
  scorers: { name: string; goals: number }[];
};

/* ── Data ───────────────────────────────────────────────────────────── */

function crestUrl(crest: unknown) {
  return crest
    ? urlFor(crest).width(80).height(80).fit("max").url()
    : undefined;
}

function outcomeOf(s: Score): Outcome {
  return s.home > s.away ? "W" : s.home < s.away ? "L" : "D";
}

async function getMatchesPageData() {
  const raw = await client.fetch<
    {
      _id: string;
      date: string;
      opponent: string;
      opponentCrest?: unknown;
      homeOrAway: string;
      venue?: string;
      matchday?: number;
      score?: Score;
      appearances?: { name?: string; goals?: number }[];
    }[]
  >(`
    *[_type == "match"] | order(date desc) {
      _id, date, opponent, opponentCrest, homeOrAway,
      venue, matchday, score,
      appearances[] {
        goals,
        "name": coalesce(player->nickname, player->name)
      }
    }
  `);

  return raw.map((m) => {
    const tally = new Map<string, number>();
    for (const a of m.appearances ?? []) {
      if (!a.goals || !a.name) continue;
      tally.set(a.name, (tally.get(a.name) ?? 0) + a.goals);
    }
    const scorers = [...tally.entries()]
      .map(([name, goals]) => ({ name, goals }))
      .sort((a, b) => b.goals - a.goals);

    return {
      _id: m._id,
      date: m.date,
      opponent: m.opponent,
      opponentCrestUrl: crestUrl(m.opponentCrest),
      homeOrAway: m.homeOrAway,
      venue: m.venue,
      matchday: m.matchday,
      score: m.score,
      outcome: m.score ? outcomeOf(m.score) : undefined,
      scorers,
    } satisfies MatchRow;
  });
}

/* ── Page ───────────────────────────────────────────────────────────── */

export default async function MatchesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("matches");
  const all = await getMatchesPageData();
  const dl = locale === "ca" ? "ca-ES" : locale === "es" ? "es-ES" : "en-GB";

  const upcoming = all
    .filter((m) => !m.score)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const results = all.filter((m) => m.score);

  return (
    <main className="min-h-screen bg-paper pt-16">
      {/* Page header */}
      <div className="border-b border-neutral-200 bg-white">
        <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
          <h1 className="display-hero text-neutral-800">{t("title")}</h1>
          <p className="mt-2 text-sm text-neutral-400">
            {t("subtitle")}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
        {/* ── Upcoming fixtures ─────────────────────────────────────── */}
        {upcoming.length > 0 && (
          <section className="mb-14">
            <SectionHead title={t("upcoming")} />
            <div className="overflow-hidden rounded-2xl bg-white shadow-card">
              {upcoming.map((m, i) => (
                <div
                  key={m._id}
                  className={i > 0 ? "border-t border-neutral-100" : ""}
                >
                  <FixtureRow match={m} dl={dl} locale={locale} />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Results ──────────────────────────────────────────────── */}
        <section>
          <SectionHead title={t("results")} />
          {results.length === 0 ? (
            <div className="rounded-2xl bg-white px-6 py-14 text-center shadow-card">
              <p className="text-sm text-neutral-400">{t("noResults")}</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl bg-white shadow-card">
              {results.map((m, i) => (
                <div
                  key={m._id}
                  className={i > 0 ? "border-t border-neutral-100" : ""}
                >
                  <ResultRow match={m} dl={dl} locale={locale} />
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   Sub-components
   ═══════════════════════════════════════════════════════════════════════ */

function SectionHead({ title }: { title: string }) {
  return (
    <div className="mb-5 flex items-center gap-3 border-b border-neutral-200 pb-3">
      <span className="h-7 w-1 shrink-0 rounded-sm bg-pitch" aria-hidden />
      <h2 className="display text-2xl sm:text-3xl">{title}</h2>
    </div>
  );
}

/* ── Fixture row ────────────────────────────────────────────────────── */

function FixtureRow({
  match,
  dl,
  locale,
}: {
  match: MatchRow;
  dl: string;
  locale: string;
}) {
  const d = new Date(match.date);
  const monthShort = d
    .toLocaleDateString(dl, { month: "short" })
    .toUpperCase()
    .replace(".", "");

  const homeLabel = locale === "ca" ? "C" : locale === "es" ? "C" : "H";
  const awayLabel = locale === "ca" ? "F" : locale === "es" ? "F" : "A";

  return (
    <div className="flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-neutral-50 sm:px-6">
      <div className="flex items-center gap-4">
        <div className="w-11 shrink-0 text-center">
          <p className="display text-[11px] text-neutral-400">{monthShort}</p>
          <p className="display text-xl leading-tight text-neutral-800">
            {d.getDate()}
          </p>
        </div>
        <div className="h-8 w-px bg-neutral-200" />
        <Crest src={match.opponentCrestUrl} name={match.opponent} />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-neutral-800">
            {match.homeOrAway === "home"
              ? `Inter Pomar vs ${match.opponent}`
              : `${match.opponent} vs Inter Pomar`}
          </p>
          <p className="mt-0.5 truncate text-xs text-neutral-400">
            {d.toLocaleDateString(dl, { weekday: "long" })} ·{" "}
            {d.toLocaleTimeString(dl, { hour: "2-digit", minute: "2-digit" })}
            {match.venue ? ` · ${match.venue}` : ""}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {match.matchday && (
          <span className="label hidden text-neutral-400 sm:inline">
            J{match.matchday}
          </span>
        )}
        <span
          className={`display shrink-0 rounded-full px-3 py-1 text-[11px] tracking-widest ${match.homeOrAway === "home"
            ? "bg-pitch text-white"
            : "bg-neutral-100 text-neutral-600"
            }`}
        >
          {match.homeOrAway === "home" ? homeLabel : awayLabel}
        </span>
      </div>
    </div>
  );
}

/* ── Result row ─────────────────────────────────────────────────────── */

function ResultRow({
  match,
  dl,
  locale,
}: {
  match: MatchRow;
  dl: string;
  locale: string;
}) {
  if (!match.score) return null;
  const o = match.outcome!;
  const line =
    match.homeOrAway === "home"
      ? `${match.score.home}–${match.score.away}`
      : `${match.score.away}–${match.score.home}`;

  const outcomeBg =
    o === "W"
      ? "bg-green-50 text-pitch"
      : o === "D"
        ? "bg-sand-100 text-result-draw"
        : "bg-red-50 text-result-loss";

  const outcomeLabel =
    o === "W"
      ? locale === "ca"
        ? "V"
        : locale === "es"
          ? "V"
          : "W"
      : o === "D"
        ? locale === "ca"
          ? "E"
          : locale === "es"
            ? "E"
            : "D"
        : locale === "ca"
          ? "D"
          : locale === "es"
            ? "D"
            : "L";

  return (
    <Link
      href={`/partits/${match._id}`}
      className="group flex items-start justify-between gap-4 px-5 py-4 transition-colors hover:bg-neutral-50 sm:px-6"
    >
      <div className="flex items-start gap-4">
        <Crest src={match.opponentCrestUrl} name={match.opponent} />
        <div className="min-w-0">
          <div className="flex items-center gap-2.5">
            <p className="truncate text-sm font-semibold text-neutral-800 group-hover:underline">
              <span className="text-neutral-400">
                {match.homeOrAway === "home" ? "vs " : "@ "}
              </span>
              {match.opponent}
            </p>
            <span
              className={`display rounded-full px-2 py-0.5 text-[10px] tracking-widest ${outcomeBg}`}
            >
              {outcomeLabel}
            </span>
          </div>
          <p className="mt-0.5 text-xs text-neutral-400">
            {new Date(match.date).toLocaleDateString(dl, {
              day: "numeric",
              month: "short",
            })}
            {match.matchday ? ` · J${match.matchday}` : ""}
          </p>
          {match.scorers.length > 0 && (
            <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-400">
              <Footprints className="size-3 shrink-0" aria-hidden />
              {match.scorers.map((s) => (
                <span key={s.name}>
                  {s.name}
                  {s.goals > 1 && (
                    <span className="numeric ml-0.5 text-[11px]">
                      ×{s.goals}
                    </span>
                  )}
                </span>
              ))}
            </p>
          )}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <p
          className={`score-display text-2xl ${o === "W" ? "text-pitch" : "text-neutral-700"
            }`}
        >
          {line}
        </p>
        <ArrowRight className="size-4 text-neutral-300 transition-transform group-hover:translate-x-0.5" />
      </div>
    </Link>
  );
}

function Crest({ src, name }: { src?: string; name: string }) {
  if (src) {
    return (
      <Image
        src={src}
        alt=""
        width={40}
        height={40}
        className="size-10 shrink-0 object-contain"
      />
    );
  }
  return (
    <div
      aria-hidden
      className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-sm font-bold text-neutral-400"
    >
      {name.charAt(0)}
    </div>
  );
}
