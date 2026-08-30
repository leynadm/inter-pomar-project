import Image from "next/image";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  MapPin,
  Goal,
  Footprints,
  Play,
  Shield,
  FileText,
  Camera,
  User,
  Navigation,
} from "lucide-react";

import { Link } from "@/app/i18n/navigation";
import { client } from "@/sanity/lib/client";
import { urlFor } from "@/sanity/lib/image";
import { AspectRatio } from "@/components/ui/aspect-ratio";

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
  };

  return map[c]?.[loc] || code;
}

function ytEmbed(url: string) {
  const m = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([^&?/]+)/,
  );
  return m ? `https://www.youtube-nocookie.com/embed/${m[1]}` : null;
}

/* ── Data Fetching ──────────────────────────────────────────────────── */

async function getMatchData(id: string) {
  return client.fetch(
    `*[_type == "match" && _id == $id][0] {
      _id,
      date,
      season,
      competition,
      opponent,
      opponentCrest,
      homeOrAway,
      venue,
      venueMapUrl,
      matchday,
      score,
      formation,
      notes,
      matchVideoUrl,
      highlightsVideoUrl,
      photos[] {
        caption,
        "asset": asset->
      },
      appearances[] {
        started,
        goals,
        assists,
        yellowCard,
        redCard,
        positionsPlayed,
        player-> {
          _id,
          name,
          nickname,
          "slug": slug.current,
          shirtNumber,
          photo,
          primaryPosition
        }
      }
    }`,
    { id },
  );
}

/* ── Page ───────────────────────────────────────────────────────────── */

export default async function MatchDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const match = await getMatchData(id);
  if (!match) notFound();

  const tPos = await getTranslations("positions");
  const dl = locale === "ca" ? "ca-ES" : locale === "es" ? "es-ES" : "en-GB";

  const isInterHome = match.homeOrAway === "home";
  const kickoffDate = new Date(match.date);
  const isPlayed = match.score?.home !== undefined && match.score?.away !== undefined;

  let outcome: "W" | "D" | "L" | null = null;
  if (isPlayed) {
    outcome =
      match.score.home > match.score.away
        ? "W"
        : match.score.home < match.score.away
          ? "L"
          : "D";
  }

  // Appearances breakdown
  const appearances = match.appearances ?? [];
  const starters = appearances.filter((a: any) => a.started);
  const subs = appearances.filter((a: any) => !a.started);

  // 1. Goalscorers
  const scorers = appearances
    .filter((a: any) => a.goals && a.goals > 0)
    .sort((a: any, b: any) => b.goals - a.goals);

  // 2. Assisters
  const assisters = appearances
    .filter((a: any) => a.assists && a.assists > 0)
    .sort((a: any, b: any) => b.assists - a.assists);

  // 3. Discipline / Cards
  const cards = appearances.filter((a: any) => a.yellowCard || a.redCard);

  const videoUrl = match.highlightsVideoUrl || match.matchVideoUrl;

  const labels = {
    back: locale === "ca" ? "Tornar als partits" : locale === "es" ? "Volver a los partidos" : "Back to matches",
    home: locale === "ca" ? "Casa" : locale === "es" ? "Casa" : "Home",
    away: locale === "ca" ? "Fora" : locale === "es" ? "Fuera" : "Away",
    matchday: locale === "ca" ? "Jornada" : locale === "es" ? "Jornada" : "Matchday",
    friendly: locale === "ca" ? "Amistós" : locale === "es" ? "Amistoso" : "Friendly",
    league: locale === "ca" ? "Lliga Sènior" : locale === "es" ? "Liga Senior" : "Senior League",
    cup: locale === "ca" ? "Copa" : locale === "es" ? "Copa" : "Cup",
    win: locale === "ca" ? "Victòria" : locale === "es" ? "Victoria" : "Win",
    draw: locale === "ca" ? "Empat" : locale === "es" ? "Empate" : "Draw",
    loss: locale === "ca" ? "Derrota" : locale === "es" ? "Derrota" : "Loss",
    starters: locale === "ca" ? "Alineació Titular" : locale === "es" ? "Alineación Titular" : "Starting XI",
    subs: locale === "ca" ? "Suplents" : locale === "es" ? "Suplentes" : "Substitutes",
    scorers: locale === "ca" ? "Golejadors" : locale === "es" ? "Goleadores" : "Goalscorers",
    assists: locale === "ca" ? "Assistències" : locale === "es" ? "Asistencias" : "Assists",
    cards: locale === "ca" ? "Targetes" : locale === "es" ? "Tarjetas" : "Cards",
    report: locale === "ca" ? "Crònica del Partit" : locale === "es" ? "Crónica del Partido" : "Match Report",
    video: locale === "ca" ? "Resum en Vídeo" : locale === "es" ? "Resumen en Vídeo" : "Match Video",
    gallery: locale === "ca" ? "Galeria del Partit" : locale === "es" ? "Galería del Partido" : "Match Photos",
    directions: locale === "ca" ? "Com arribar" : locale === "es" ? "Cómo llegar" : "Directions",
  };

  const competitionLabel =
    match.competition === "friendly" || match.competition === "Partido Amistoso"
      ? labels.friendly
      : match.competition === "cup"
        ? labels.cup
        : labels.league;

  return (
    <main className="min-h-screen bg-paper pb-20">

      {/* ═════════════════════════════════════════════════════════════════
         1. Hero Scoreboard Banner
         ═════════════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-linear-to-b from-pitch to-pitch-deep pt-24 pb-14 text-white sm:pt-28 sm:pb-16 md:pt-32">
        <div className="mow absolute inset-0 opacity-40" aria-hidden />

        <div className="relative mx-auto max-w-5xl px-5">
          {/* Breadcrumb Back Link */}
          <Link
            href="/partits"
            className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-neutral-950/30 px-4 py-1.5 text-xs font-semibold text-white/85 backdrop-blur-sm transition-all duration-fast hover:border-sand-300 hover:bg-white hover:text-white"
          >
            <ArrowLeft className="size-3.5 text-sand-300" />
            <span className="label">{labels.back}</span>
          </Link>

          {/* Competition & Matchday Pill */}
          <div className="mt-6 flex justify-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-neutral-950/40 px-4 py-1.5 backdrop-blur-md">
              <span className="size-1.5 rounded-full bg-sand-400" />
              <span className="label text-sand-200">
                {competitionLabel}
                {match.matchday ? ` · ${labels.matchday} ${match.matchday}` : ""}
                {match.season ? ` · ${match.season}` : ""}
              </span>
            </span>
          </div>

          {/* Scoreboard Matchup */}
          <div className="mt-8 grid grid-cols-[1fr_auto_1fr] items-center gap-3 sm:gap-8 md:gap-12">

            {/* Inter Pomar */}
            <div className="flex flex-col items-center text-center">
              <div className="relative flex size-24 items-center justify-center rounded-2xl border border-white/20 bg-white p-3 shadow-2xl backdrop-blur-md sm:size-28 md:size-32">
                <Image
                  src="/clear_crest.png"
                  alt="Inter Pomar"
                  width={84}
                  height={96}
                  priority
                  className="max-h-full max-w-full object-contain drop-shadow-md"
                />
              </div>
              <p className="display mt-3 text-base font-bold text-white sm:text-lg md:text-xl">
                Inter Pomar
              </p>
              <span
                className={`label mt-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold tracking-wider ${isInterHome
                  ? "border border-sand-400/30 bg-sand-400/20 text-sand-200"
                  : "bg-white/10 text-white/75"
                  }`}
              >
                {isInterHome ? labels.home : labels.away}
              </span>
            </div>

            {/* Score / VS Center Display */}
            <div className="flex flex-col items-center justify-center">
              {isPlayed ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="flex items-center gap-3 rounded-2xl border border-white/20 bg-neutral-950/80 px-6 py-3 shadow-2xl backdrop-blur-md">
                    <span className="score-display text-4xl font-bold text-white sm:text-5xl md:text-6xl">
                      {match.score.home}
                    </span>
                    <span className="score-display text-2xl text-sand-400 sm:text-3xl">
                      –
                    </span>
                    <span className="score-display text-4xl font-bold text-white sm:text-5xl md:text-6xl">
                      {match.score.away}
                    </span>
                  </div>
                  {outcome && (
                    <span
                      className={`display rounded-full px-3 py-0.5 text-[11px] font-semibold tracking-widest ${outcome === "W"
                        ? "bg-result-win text-white"
                        : outcome === "D"
                          ? "bg-result-draw text-white"
                          : "bg-result-loss text-white"
                        }`}
                    >
                      {outcome === "W"
                        ? labels.win
                        : outcome === "D"
                          ? labels.draw
                          : labels.loss}
                    </span>
                  )}
                </div>
              ) : (
                <div className="flex size-14 items-center justify-center rounded-full border border-white/20 bg-neutral-950/60 shadow-lg backdrop-blur-md">
                  <span className="display text-xl font-bold text-sand-300">
                    VS
                  </span>
                </div>
              )}
            </div>

            {/* Opponent */}
            <div className="flex flex-col items-center text-center">
              <div className="relative flex size-24 items-center justify-center rounded-2xl border border-white/20 bg-white p-3 shadow-2xl backdrop-blur-md sm:size-28 md:size-32">
                {match.opponentCrest ? (
                  <Image
                    src={urlFor(match.opponentCrest).width(120).height(120).url()}
                    alt={match.opponent}
                    width={84}
                    height={96}
                    className="max-h-full max-w-full rounded-lg object-contain drop-shadow-md"
                  />
                ) : (
                  <div className="flex size-full items-center justify-center rounded-xl bg-neutral-900/40">
                    <span className="display text-3xl font-bold text-white/60 sm:text-4xl">
                      {match.opponent.charAt(0)}
                    </span>
                  </div>
                )}
              </div>
              <p className="display mt-3 max-w-[130px] truncate text-base font-bold text-white sm:max-w-[200px] sm:text-lg md:text-xl">
                {match.opponent}
              </p>
              <span
                className={`label mt-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold tracking-wider ${!isInterHome
                  ? "border border-sand-400/30 bg-sand-400/20 text-sand-200"
                  : "bg-white/10 text-white/75"
                  }`}
              >
                {!isInterHome ? labels.home : labels.away}
              </span>
            </div>
          </div>

          {/* Match Metadata Pills */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2.5 text-xs text-white/90 sm:gap-3.5 sm:text-sm">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-neutral-950/40 px-3.5 py-1.5 shadow-sm backdrop-blur-sm">
              <CalendarDays className="size-4 text-sand-300" />
              <span className="capitalize">
                {kickoffDate.toLocaleDateString(dl, {
                  weekday: "short",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </span>

            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-neutral-950/40 px-3.5 py-1.5 shadow-sm backdrop-blur-sm">
              <Clock className="size-4 text-sand-300" />
              <span>
                {kickoffDate.toLocaleTimeString(dl, {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
                h
              </span>
            </span>

            {match.venue && (
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-neutral-950/40 px-3.5 py-1.5 shadow-sm backdrop-blur-sm">
                <MapPin className="size-4 text-sand-300" />
                <span>{match.venue}</span>
              </span>
            )}

            {match.venueMapUrl && (
              <a
                href={match.venueMapUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-white transition-all hover:bg-white/20"
              >
                <Navigation className="size-3.5 text-sand-300" />
                {labels.directions}
              </a>
            )}
          </div>
        </div>
      </section>

      {/* ═════════════════════════════════════════════════════════════════
         2. Main Content Grid
         ═════════════════════════════════════════════════════════════════ */}
      <div className="mx-auto max-w-5xl px-5 pt-10 sm:px-8 sm:pt-14">

        {/* ── Key Events Banner (Goals, Assists & Cards - 3 Columns) ── */}
        {isPlayed && (scorers.length > 0 || assisters.length > 0 || cards.length > 0) && (
          <div className="mb-10 overflow-hidden rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-card">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:divide-x md:divide-neutral-100">

              {/* 1. Goalscorers */}
              <div>
                <div className="mb-3 flex items-center gap-2">
                  <Goal className="size-4 text-pitch" />
                  <h3 className="display text-sm font-bold text-neutral-800">
                    {labels.scorers}
                  </h3>
                </div>
                {scorers.length > 0 ? (
                  <div className="flex flex-wrap gap-x-3 gap-y-2">
                    {scorers.map((s: any, idx: number) => {
                      const name = s.player?.nickname || s.player?.name;
                      return (
                        <div key={idx} className="flex items-center gap-1.5 text-sm">
                          <span className="font-semibold text-neutral-800">
                            {name}
                          </span>
                          {s.goals > 1 ? (
                            <span className="score-display rounded-md bg-green-50 px-1.5 py-0.5 text-xs font-bold text-pitch">
                              ⚽ ×{s.goals}
                            </span>
                          ) : (
                            <span className="text-xs">⚽</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-neutral-400">Cap gol registrat</p>
                )}
              </div>

              {/* 2. Assisters */}
              <div className="md:pl-6">
                <div className="mb-3 flex items-center gap-2">
                  <Footprints className="size-4 text-pitch" />
                  <h3 className="display text-sm font-bold text-neutral-800">
                    {labels.assists}
                  </h3>
                </div>
                {assisters.length > 0 ? (
                  <div className="flex flex-wrap gap-x-3 gap-y-2">
                    {assisters.map((a: any, idx: number) => {
                      const name = a.player?.nickname || a.player?.name;
                      return (
                        <div key={idx} className="flex items-center gap-1.5 text-sm">
                          <span className="font-semibold text-neutral-800">
                            {name}
                          </span>
                          {a.assists > 1 ? (
                            <span className="score-display rounded-md bg-sand-100 px-1.5 py-0.5 text-xs font-bold text-[#9A7D1A]">
                              👣 ×{a.assists}
                            </span>
                          ) : (
                            <span className="text-xs text-neutral-500">👣</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-neutral-400">Cap assistència</p>
                )}
              </div>

              {/* 3. Discipline / Cards */}
              <div className="md:pl-6">
                <div className="mb-3 flex items-center gap-2">
                  <Shield className="size-4 text-neutral-500" />
                  <h3 className="display text-sm font-bold text-neutral-800">
                    {labels.cards}
                  </h3>
                </div>
                {cards.length > 0 ? (
                  <div className="flex flex-wrap gap-2.5">
                    {cards.map((c: any, idx: number) => {
                      const name = c.player?.nickname || c.player?.name;
                      return (
                        <div key={idx} className="flex items-center gap-1.5 text-xs">
                          {c.yellowCard && (
                            <span className="inline-block h-3.5 w-2.5 rounded-2xs bg-amber-400 shadow-xs" title="Targeta groga" />
                          )}
                          {c.redCard && (
                            <span className="inline-block h-3.5 w-2.5 rounded-2xs bg-red-500 shadow-xs" title="Targeta vermella" />
                          )}
                          <span className="font-medium text-neutral-700">
                            {name}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-neutral-400">Sense targetes</p>
                )}
              </div>

            </div>
          </div>
        )}

        {/* ── Video Highlights ── */}
        {videoUrl && ytEmbed(videoUrl) && (
          <section className="mb-12">
            <SectionHead title={labels.video} icon={<Play className="size-4 text-pitch" />} />
            <div className="overflow-hidden rounded-2xl border border-neutral-200/80 bg-white shadow-card">
              <AspectRatio ratio={16 / 9}>
                <iframe
                  src={ytEmbed(videoUrl)!}
                  title={`Inter Pomar vs ${match.opponent}`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="size-full"
                />
              </AspectRatio>
            </div>
          </section>
        )}

        {/* ── Lineup & Squad Appearances ── */}
        <section className="mb-12">
          <div className="mb-4 flex items-center justify-between">
            <SectionHead
              title={labels.starters}
              icon={<Shield className="size-4 text-pitch" />}
            />
            {match.formation && (
              <span className="score-display rounded-full bg-neutral-900 px-3 py-1 text-xs font-bold text-sand-300">
                {match.formation}
              </span>
            )}
          </div>

          {/* Starters Grid */}
          <div className="overflow-hidden rounded-2xl border border-neutral-200/80 bg-white shadow-card">
            {starters.length > 0 ? (
              <div className="divide-y divide-neutral-100">
                {starters.map((a: any, idx: number) => (
                  <PlayerLineupRow
                    key={a.player?._id || idx}
                    appearance={a}
                    locale={locale}
                    tPos={tPos}
                  />
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-sm text-neutral-400">
                No hi ha dades d'alineació disponibles.
              </div>
            )}
          </div>

          {/* Substitutes */}
          {subs.length > 0 && (
            <div className="mt-8">
              <h3 className="display mb-3 text-sm font-bold text-neutral-600">
                {labels.subs} ({subs.length})
              </h3>
              <div className="overflow-hidden rounded-2xl border border-neutral-200/80 bg-white shadow-card">
                <div className="divide-y divide-neutral-100">
                  {subs.map((a: any, idx: number) => (
                    <PlayerLineupRow
                      key={a.player?._id || idx}
                      appearance={a}
                      locale={locale}
                      tPos={tPos}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </section>

        {/* ── Match Report / Notes ── */}
        {match.notes && (
          <section className="mb-12">
            <SectionHead
              title={labels.report}
              icon={<FileText className="size-4 text-pitch" />}
            />
            <div className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-card sm:p-8">
              <p className="text-sm/relaxed whitespace-pre-line text-neutral-700 sm:text-base/relaxed">
                {match.notes}
              </p>
            </div>
          </section>
        )}

        {/* ── Match Photos Gallery ── */}
        {match.photos && match.photos.length > 0 && (
          <section className="mb-12">
            <SectionHead
              title={labels.gallery}
              icon={<Camera className="size-4 text-pitch" />}
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {match.photos.map((photo: any, idx: number) => (
                <div
                  key={idx}
                  className="group relative aspect-[4/3] overflow-hidden rounded-2xl border border-neutral-200/80 bg-neutral-100 shadow-card"
                >
                  <Image
                    src={urlFor(photo).width(600).height(450).fit("crop").url()}
                    alt={photo.caption || "Match photo"}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  {photo.caption && (
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 pt-6 text-xs text-white">
                      {photo.caption}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

      </div>
    </main>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   Sub-Components
   ═══════════════════════════════════════════════════════════════════════ */

function SectionHead({
  title,
  icon,
}: {
  title: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="mb-4 flex items-center gap-2.5">
      <span className="h-5 w-1 shrink-0 rounded-sm bg-pitch" aria-hidden />
      <h2 className="display flex items-center gap-2 text-lg font-bold text-neutral-900 sm:text-xl">
        {icon}
        {title}
      </h2>
    </div>
  );
}

function PlayerLineupRow({
  appearance,
  locale,
  tPos,
}: {
  appearance: any;
  locale: string;
  tPos: any;
}) {
  const p = appearance.player;
  if (!p) return null;

  const displayName = p.nickname || p.name;
  const positions = appearance.positionsPlayed?.length
    ? appearance.positionsPlayed
    : [p.primaryPosition];

  return (
    <div className="flex items-center justify-between gap-3 px-5 py-3.5 transition-colors hover:bg-neutral-50/80 sm:px-6">
      <div className="flex items-center gap-3.5">
        {/* Shirt Number */}
        <span className="score-display w-6 text-center text-sm font-bold text-neutral-400">
          {p.shirtNumber ?? "–"}
        </span>

        {/* Circular Avatar */}
        <div className="size-9 shrink-0 overflow-hidden rounded-full border border-neutral-200 bg-black">
          {p.photo ? (
            <Image
              src={urlFor(p.photo).width(40).height(40).fit("crop").url()}
              alt={displayName}
              width={36}
              height={36}
              className="size-full object-contain object-top"
            />
          ) : (
            <div className="flex size-full items-center justify-center bg-green-50 text-pitch">
              <User className="size-4 text-neutral-400" />
            </div>
          )}
        </div>

        {/* Name & Position */}
        <div className="min-w-0">
          <Link
            href={`/plantilla/${p.slug}`}
            className="display block truncate text-sm font-bold text-neutral-900 transition-colors hover:text-pitch"
          >
            {displayName}
          </Link>
          <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-neutral-500">
            {positions.map((pos: string, idx: number) => (
              <span key={idx}>
                {idx > 0 && " → "}
                <span className="font-semibold text-pitch">
                  {posShort(pos, locale)}
                </span>{" "}
                <span className="text-neutral-400">({tPos(pos)})</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Match Events (Goals, Assists, Cards) */}
      <div className="flex shrink-0 items-center gap-2">
        {appearance.goals > 0 && (
          <span className="score-display rounded-full bg-green-50 px-2 py-0.5 text-xs font-bold text-pitch">
            ⚽ {appearance.goals > 1 ? `×${appearance.goals}` : ""}
          </span>
        )}
        {appearance.assists > 0 && (
          <span className="score-display rounded-full bg-sand-100 px-2 py-0.5 text-xs font-bold text-[#9A7D1A]">
            👣 {appearance.assists > 1 ? `×${appearance.assists}` : ""}
          </span>
        )}
        {appearance.yellowCard && (
          <span className="inline-block h-4 w-3 rounded-2xs bg-amber-400 shadow-xs" title="Targeta groga" />
        )}
        {appearance.redCard && (
          <span className="inline-block h-4 w-3 rounded-2xs bg-red-500 shadow-xs" title="Targeta vermella" />
        )}
      </div>
    </div>
  );
}
