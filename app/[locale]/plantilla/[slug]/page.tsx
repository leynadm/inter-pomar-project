import Image from "next/image";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import {
  ArrowLeft,
  FileText,
  User,
  Shield,
  Sparkles,
} from "lucide-react";

import { Link } from "@/app/i18n/navigation";
import { client } from "@/sanity/lib/client";
import { urlFor } from "@/sanity/lib/image";
import {
  getFlagUrl,
  strengths as allStrengths,
} from "@/lib/football-constants";

/* ── Localized Position Code Translator ─────────────────────────────── */

function posShort(code: string, locale: string): string {
  if (!code) return "";
  const c = code.toUpperCase();
  const loc = locale === "ca" ? "ca" : locale === "es" ? "es" : "en";

  const map: Record<string, { ca: string; es: string; en: string }> = {
    GK: { ca: "POR", es: "POR", en: "GK" },
    POR: { ca: "POR", es: "POR", en: "GK" },
    CB: { ca: "DFC", es: "DFC", en: "CB" },
    DFC: { ca: "DFC", es: "DFC", en: "CB" },
    LB: { ca: "LE", es: "LI", en: "LB" },
    RB: { ca: "LD", es: "LD", en: "RB" },
    CDM: { ca: "MCD", es: "MCD", en: "CDM" },
    CM: { ca: "MC", es: "MC", en: "CM" },
    CAM: { ca: "MCO", es: "MCO", en: "CAM" },
    LM: { ca: "ME", es: "MI", en: "LM" },
    RM: { ca: "MD", es: "MD", en: "RM" },
    LW: { ca: "EE", es: "EI", en: "LW" },
    LWF: { ca: "EE", es: "EI", en: "LWF" },
    RW: { ca: "ED", es: "ED", en: "RW" },
    RWF: { ca: "ED", es: "ED", en: "RWF" },
    CF: { ca: "DC", es: "DC", en: "CF" },
    ST: { ca: "DC", es: "DC", en: "ST" },
    DEF: { ca: "DEF", es: "DEF", en: "DEF" },
    MID: { ca: "MIG", es: "MED", en: "MID" },
    FWD: { ca: "DAV", es: "DEL", en: "FWD" },
  };

  return map[c]?.[loc] || code;
}

/* ── Data fetching ──────────────────────────────────────────────────── */

async function getPlayer(slug: string) {
  return client.fetch(
    `*[_type == "player" && slug.current == $slug][0] {
      _id,
      name,
      nickname,
      slug,
      shirtNumber,
      photo,
      primaryPosition,
      secondaryPositions,
      nationality,
      secondNationality,
      preferredFoot,
      strengths,
      status,
      bio
    }`,
    { slug },
  );
}

async function getPlayerStats(playerId: string) {
  return client.fetch(
    `{
      "appearances": count(*[_type == "match" && defined(score.home) && references($id)]),
      "goals": math::sum(*[_type == "match" && defined(score.home)].appearances[player._ref == $id].goals),
      "assists": math::sum(*[_type == "match" && defined(score.home)].appearances[player._ref == $id].assists),
      "yellowCards": count(*[_type == "match" && defined(score.home) && count(appearances[player._ref == $id && yellowCard == true]) > 0]),
      "redCards": count(*[_type == "match" && defined(score.home) && count(appearances[player._ref == $id && redCard == true]) > 0]),
      "started": count(*[_type == "match" && defined(score.home) && count(appearances[player._ref == $id && started == true]) > 0])
    }`,
    { id: playerId },
  );
}

function splitName(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return { given: "", family: parts[0] };
  return { given: parts[0], family: parts.slice(1).join(" ") };
}

/* ── Strength tag color mapping (Design System §4h) ─────────────────── */

const STRENGTH_STYLES: Record<
  string,
  { bg: string; dot: string; text: string }
> = {
  physical: {
    bg: "bg-sand-100",
    dot: "bg-result-draw",
    text: "text-[#9A7D1A]",
  },
  defending: {
    bg: "bg-blue-50",
    dot: "bg-blue-600",
    text: "text-blue-600",
  },
  passing: {
    bg: "bg-green-50",
    dot: "bg-pitch",
    text: "text-pitch",
  },
  dribbling: {
    bg: "bg-green-50",
    dot: "bg-pitch",
    text: "text-pitch",
  },
  shooting: {
    bg: "bg-red-50",
    dot: "bg-red-600",
    text: "text-red-600",
  },
  goalkeeping: {
    bg: "bg-sand-100",
    dot: "bg-result-draw",
    text: "text-[#9A7D1A]",
  },
  mental: {
    bg: "bg-blue-50",
    dot: "bg-blue-600",
    text: "text-blue-600",
  },
};

/* ── Page ───────────────────────────────────────────────────────────── */

export default async function PlayerPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const player = await getPlayer(slug);
  if (!player) notFound();

  const stats = await getPlayerStats(player._id);
  const tPos = await getTranslations("positions");
  const tStats = await getTranslations("stats");
  const tFoot = await getTranslations("foot");
  const tStrengths = await getTranslations("strengths");

  const { given, family } = splitName(player.nickname || player.name);
  const secondFlag = player.secondNationality
    ? getFlagUrl(player.secondNationality, 80)
    : null;

  const strengthMap = Object.fromEntries(
    allStrengths.map((s) => [s.value, s]),
  );

  const labels = {
    back:
      locale === "ca"
        ? "Tornar a la plantilla"
        : locale === "es"
          ? "Volver a la plantilla"
          : "Back to squad",
    season:
      locale === "ca"
        ? "Temporada"
        : locale === "es"
          ? "Temporada"
          : "Season",
    profile:
      locale === "ca"
        ? "Fitxa tècnica"
        : locale === "es"
          ? "Ficha técnica"
          : "Technical Profile",
    positions:
      locale === "ca"
        ? "Demarcacions"
        : locale === "es"
          ? "Posiciones"
          : "Positions",
    strengths:
      locale === "ca"
        ? "Qualitats principals"
        : locale === "es"
          ? "Cualidades principales"
          : "Key Strengths",
    bio:
      locale === "ca"
        ? "Biografia"
        : locale === "es"
          ? "Biografía"
          : "Biography",
    foot:
      locale === "ca"
        ? "Cama hàbil"
        : locale === "es"
          ? "Pierna hábil"
          : "Preferred foot",
    starts:
      locale === "ca" ? "titular" : locale === "es" ? "titular" : "starts",
    primary:
      locale === "ca" ? "Principal" : locale === "es" ? "Principal" : "Primary",
    discipline:
      locale === "ca"
        ? "Targetes"
        : locale === "es"
          ? "Tarjetas"
          : "Cards",
    perMatch:
      locale === "ca"
        ? "/ partit"
        : locale === "es"
          ? "/ partido"
          : "/ match",
  };

  const starterPct =
    stats.appearances > 0
      ? Math.round((stats.started / stats.appearances) * 100)
      : 0;

  return (
    <main className="min-h-screen bg-paper">
      {/* ═════════════════════════════════════════════════════════════════
         1. Hero Header
         ═════════════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-linear-to-br from-pitch via-green-800 to-pitch-deep pt-24 text-white sm:pt-28">
        <div className="mow absolute inset-0 opacity-40" aria-hidden />

        <div className="relative mx-auto max-w-6xl px-5 sm:px-8">
          {/* Back breadcrumb */}
          <Link
            href="/plantilla"
            className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-neutral-950/30 px-3.5 py-1.5 text-xs text-white/85 shadow-sm backdrop-blur-sm transition-all duration-fast hover:border-sand-300 hover:bg-white/15 hover:text-white"
          >
            <ArrowLeft className="size-3.5 text-sand-300" />
            <span className="label text-[11px] font-semibold">{labels.back}</span>
          </Link>

          {/* Profile Identity */}
          <div className="mt-6 flex flex-col items-center gap-6 pb-8 sm:flex-row sm:items-end sm:gap-8 sm:pb-10">
            {/* Circular Photo Frame */}
            <div className="relative flex size-28 shrink-0 items-center justify-center overflow-hidden rounded-full border-3 border-white bg-black shadow-md ring-1 ring-neutral-200/60 sm:size-36 lg:size-40">
              {player.photo ? (
                <Image
                  src={urlFor(player.photo).width(320).height(320).url()}
                  alt={player.name}
                  width={160}
                  height={160}
                  priority
                  className="size-full object-contain object-top"
                />
              ) : (
                <div className="flex size-full items-center justify-center bg-green-50 text-pitch">
                  {player.shirtNumber != null ? (
                    <span className="score-display text-4xl font-bold">
                      {player.shirtNumber}
                    </span>
                  ) : (
                    <User className="size-14 text-neutral-400" />
                  )}
                </div>
              )}
            </div>

            {/* Identity Details */}
            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center gap-3 sm:justify-start">
                {player.shirtNumber != null && (
                  <span className="score-display rounded-lg bg-neutral-950/40 px-2.5 py-0.5 text-base font-bold text-sand-300 backdrop-blur-xs">
                    #{player.shirtNumber}
                  </span>
                )}
                {player.nationality && (
                  <div className="overflow-hidden rounded-xs shadow-xs ring-1 ring-white/30">
                    <Image
                      src={getFlagUrl(player.nationality, 80)}
                      alt={player.nationality}
                      width={24}
                      height={16}
                      className="h-4 w-6 object-cover"
                    />
                  </div>
                )}
                {secondFlag && (
                  <div className="overflow-hidden rounded-xs shadow-xs ring-1 ring-white/30">
                    <Image
                      src={secondFlag}
                      alt=""
                      width={24}
                      height={16}
                      className="h-4 w-6 object-cover"
                    />
                  </div>
                )}
              </div>

              <h1 className="display mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
                {given && (
                  <span className="font-normal text-white/60">{given} </span>
                )}
                {family}
              </h1>

              {/* Localized position tag in Hero */}
              <div className="mt-2 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                <span className="display rounded-full bg-sand-400/20 px-3 py-1 text-xs font-semibold tracking-wider text-sand-200 border border-sand-400/30">
                  {tPos(player.primaryPosition)}
                </span>
                {player.preferredFoot && (
                  <span className="display rounded-full bg-white/10 px-3 py-1 text-xs font-semibold tracking-wider text-white/80">
                    {tFoot(player.preferredFoot)}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* High-Contrast Stats Banner */}
        <div className="border-t border-white/15 bg-neutral-950/60 backdrop-blur-md">
          <div className="mx-auto grid max-w-6xl grid-cols-2 divide-x divide-white/10 sm:grid-cols-4">
            <StatHero
              label={tStats("appearances")}
              value={stats.appearances}
              sub={`${stats.started} ${labels.starts} (${starterPct}%)`}
            />
            <StatHero
              label={tStats("goals")}
              value={stats.goals}
              sub={`${stats.appearances > 0 ? (stats.goals / stats.appearances).toFixed(2) : "0.00"} ${labels.perMatch}`}
              accent
            />
            <StatHero
              label={tStats("assists")}
              value={stats.assists}
              sub={`${stats.appearances > 0 ? (stats.assists / stats.appearances).toFixed(2) : "0.00"} ${labels.perMatch}`}
            />
            <StatHero
              label={labels.discipline}
              value={null}
              cards={{ yellow: stats.yellowCards, red: stats.redCards }}
            />
          </div>
        </div>
      </section>

      {/* ═════════════════════════════════════════════════════════════════
         2. Content Grid
         ═════════════════════════════════════════════════════════════════ */}
      <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">

          {/* ── Main Column ── */}
          <div className="space-y-8">

            {/* Demarcacions / Positions with Localized Codes (e.g. DC · Davanter centre) */}
            <ContentCard title={labels.positions} icon={<Shield className="size-4 text-pitch" />}>
              <div className="flex flex-wrap gap-2.5">
                {/* Primary Position Badge */}
                <span className="display inline-flex items-center gap-2 rounded-full bg-pitch px-4 py-1.5 text-xs font-semibold tracking-wider text-white shadow-xs">
                  <span className="size-1.5 rounded-full bg-white" />
                  {posShort(player.primaryPosition, locale)} · {tPos(player.primaryPosition)} ({labels.primary})
                </span>

                {/* Secondary Positions Badges */}
                {player.secondaryPositions?.map((pos: string) => (
                  <span
                    key={pos}
                    className="display inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-neutral-50 px-3.5 py-1.5 text-xs font-semibold tracking-wider text-neutral-700"
                  >
                    {posShort(pos, locale)} · {tPos(pos)}
                  </span>
                ))}
              </div>
            </ContentCard>

            {/* Strengths Tags with Translations */}
            {player.strengths?.length > 0 && (
              <ContentCard title={labels.strengths} icon={<Sparkles className="size-4 text-pitch" />}>
                <div className="flex flex-wrap gap-2.5">
                  {player.strengths.map((slug: string) => {
                    const s = strengthMap[slug];
                    if (!s) return null;
                    const style =
                      STRENGTH_STYLES[s.category] ?? STRENGTH_STYLES.mental;

                    const translatedTitle = tStrengths.has(slug)
                      ? tStrengths(slug)
                      : s.title;

                    return (
                      <span
                        key={slug}
                        className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold ${style.bg} ${style.text} shadow-2xs`}
                      >
                        <span className={`size-2 rounded-full ${style.dot}`} />
                        {translatedTitle}
                      </span>
                    );
                  })}
                </div>
              </ContentCard>
            )}

            {/* Biography */}
            {player.bio && (
              <ContentCard title={labels.bio} icon={<FileText className="size-4 text-pitch" />}>
                <p className="text-sm/relaxed text-neutral-700">
                  {player.bio}
                </p>
              </ContentCard>
            )}
          </div>

          {/* ── Sidebar: Fitxa Tècnica ── */}
          <aside className="space-y-6">
            <div className="overflow-hidden rounded-2xl border border-neutral-200/80 bg-white shadow-card">
              <div className="border-b border-neutral-100 bg-neutral-50/70 px-5 py-3.5">
                <h3 className="display text-sm font-bold tracking-wider text-neutral-800">
                  {labels.profile}
                </h3>
              </div>
              <dl className="divide-y divide-neutral-100 text-sm">
                <ProfileRow
                  label={labels.positions}
                  value={`${posShort(player.primaryPosition, locale)} · ${tPos(player.primaryPosition)}`}
                />
                {player.preferredFoot && (
                  <ProfileRow
                    label={labels.foot}
                    value={tFoot(player.preferredFoot)}
                  />
                )}
                {player.nationality && (
                  <ProfileRow
                    label={
                      locale === "ca"
                        ? "Nacionalitat"
                        : locale === "es"
                          ? "Nacionalidad"
                          : "Nationality"
                    }
                    value={player.nationality.toUpperCase()}
                  />
                )}
                {player.status && (
                  <ProfileRow
                    label={
                      locale === "ca"
                        ? "Estat"
                        : locale === "es"
                          ? "Estado"
                          : "Status"
                    }
                    value={player.status}
                    capitalize
                  />
                )}
              </dl>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   Sub-components
   ═══════════════════════════════════════════════════════════════════════ */

function StatHero({
  label,
  value,
  sub,
  accent,
  cards,
}: {
  label: string;
  value: number | null;
  sub?: string;
  accent?: boolean;
  cards?: { yellow: number; red: number };
}) {
  return (
    <div className="px-4 py-4 text-center sm:px-6 sm:py-5">
      {value !== null ? (
        <p
          className={`score-display text-2xl font-bold sm:text-3xl ${accent ? "text-sand-300" : "text-white"
            }`}
        >
          {value}
        </p>
      ) : (
        <div className="flex items-center justify-center gap-3 py-1">
          <span className="flex items-center gap-1.5 score-display text-base font-bold text-amber-300">
            <span className="inline-block h-4 w-3 rounded-2xs bg-amber-400 shadow-xs" />
            {cards?.yellow ?? 0}
          </span>
          <span className="flex items-center gap-1.5 score-display text-base font-bold text-red-400">
            <span className="inline-block h-4 w-3 rounded-2xs bg-red-500 shadow-xs" />
            {cards?.red ?? 0}
          </span>
        </div>
      )}
      <p className="label mt-1 text-[10px] font-semibold tracking-widest text-white/50">
        {label}
      </p>
      {sub && (
        <p className="label mt-0.5 text-[10px] text-white/40 tracking-wider font-normal">
          {sub}
        </p>
      )}
    </div>
  );
}

function ContentCard({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-card">
      <div className="mb-4 flex items-center gap-2.5">
        <span className="h-5 w-1 shrink-0 rounded-sm bg-pitch" aria-hidden />
        <h2 className="display flex items-center gap-2 text-lg font-bold text-neutral-900 sm:text-xl">
          {icon}
          {title}
        </h2>
      </div>
      {children}
    </section>
  );
}

function ProfileRow({
  label,
  value,
  capitalize,
}: {
  label: string;
  value: string;
  capitalize?: boolean;
}) {
  return (
    <div className="flex items-center justify-between px-5 py-3.5">
      <dt className="text-xs font-medium text-neutral-500">{label}</dt>
      <dd
        className={`display text-xs font-bold text-neutral-800 ${capitalize ? "capitalize" : ""
          }`}
      >
        {value}
      </dd>
    </div>
  );
}
