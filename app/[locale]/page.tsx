import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { getHomepageData } from "@/sanity/lib/queries";
import { Link } from "../i18n/navigation";
import { MatchdayHero } from "@/components/home/matchday-hero";
import { MatchCenter } from "@/components/home/match-center";
import { SeasonPanel } from "@/components/home/season-panel";
import { SquadStrip } from "@/components/home/squad-strip";
import { ArrowRight } from "lucide-react";

const HERO_IMAGE: string | null = null;
const CLUB_IMAGE: string | null = null;

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("home");
  const data = await getHomepageData();

  return (
    <main>
      <MatchdayHero
        match={data.nextMatch}
        locale={locale}
        image={HERO_IMAGE}
        copy={{
          nextMatch: t("hero.nextMatch"),
          home: t("hero.home"),
          away: t("hero.away"),
          matchday: t("hero.matchday"),
          kickoff: t("hero.kickoff"),
          live: t("hero.live"),
          directions: t("hero.directions"),
          days: t("countdown.days"),
          hours: t("countdown.hours"),
          mins: t("countdown.mins"),
          secs: t("countdown.secs"),
          noMatch: t("hero.noMatch"),
          noMatchBody: t("hero.noMatchBody"),
        }}
      />

      {/* ── Match centre ────────────────────────────────────────────── */}
      <Section>
        <SectionHead
          title={t("matchCenter.title")}
          href="/partits"
          cta={t("matchCenter.all")}
        />
        <MatchCenter
          fixtures={data.upcomingFixtures ?? []}
          results={data.recentResults ?? []}
          latestVideo={data.latestMatchWithVideo}
          locale={locale}
          copy={{
            fixtures: t("matchCenter.fixtures"),
            results: t("matchCenter.results"),
            video: t("matchCenter.video"),
            noFixtures: t("matchCenter.noFixtures"),
            noResults: t("matchCenter.noResults"),
            noVideo: t("matchCenter.noVideo"),
            matchdayShort: t("matchCenter.matchdayShort"),
            win: t("outcome.win"),
            draw: t("outcome.draw"),
            loss: t("outcome.loss"),
          }}
        />
      </Section>

      {/* ── Season ──────────────────────────────────────────────────── */}
      <div className="bg-neutral-100">
        <Section>
          <SectionHead title={t("season.title")} />
          <SeasonPanel
            totals={data.seasonTotals}
            scorers={data.topScorers ?? []}
            copy={{
              season: t("season.title"),
              played: t("season.played"),
              record: t("season.record"),
              goalsFor: t("season.goalsFor"),
              goalsAgainst: t("season.goalsAgainst"),
              form: t("season.form"),
              scorers: t("season.scorers"),
              goals: t("season.goals"),
              noScorers: t("season.noScorers"),
            }}
          />
        </Section>
      </div>

      {/* ── Squad ───────────────────────────────────────────────────── */}
      <Section>
        <SectionHead
          title={t("squad.title")}
          href="/plantilla"
          cta={t("squad.all")}
        />
        <SquadStrip players={data.squadPreview ?? []} />
      </Section>

      {/* ── The club ────────────────────────────────────────────────── */}
      <section className="relative isolate overflow-hidden bg-linear-to-br from-pitch to-pitch-deep text-white">
        {CLUB_IMAGE ? (
          <>
            <Image
              src={CLUB_IMAGE}
              alt=""
              fill
              sizes="100vw"
              className="object-cover"
            />
            <div className="duotone absolute inset-0" aria-hidden />
          </>
        ) : null}
        <div className="mow absolute inset-0 opacity-40" aria-hidden />

        <div className="relative mx-auto max-w-2xl px-6 py-16 text-center sm:py-20">
          <p className="label text-white/50">Badalona · 2024</p>
          <p className="editorial mt-5 text-xl text-white/85 sm:text-2xl">
            {t("club.lede")}
          </p>
          <Link
            href="/club"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-pitch transition-colors hover:bg-white/90"
          >
            {t("club.cta")}
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}

/* ── Layout helpers ──────────────────────────────────────────────────── */

function Section({ children }: { children: React.ReactNode }) {
  return (
    <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
      {children}
    </section>
  );
}

function SectionHead({
  title,
  href,
  cta,
}: {
  title: string;
  href?: "/partits" | "/plantilla" | "/galeria";
  cta?: string;
}) {
  return (
    <div className="mb-7 flex items-end justify-between gap-4 border-b border-neutral-200 pb-3">
      <h2 className="display flex items-center gap-3 text-3xl sm:text-4xl">
        <span
          className="h-7 w-1 shrink-0 rounded-sm bg-pitch"
          aria-hidden
        />
        {title}
      </h2>
      {href && cta && (
        <Link
          href={href}
          className="display flex shrink-0 items-center gap-1.5 text-sm tracking-widest text-neutral-500 transition-colors hover:text-pitch"
        >
          {cta}
          <ArrowRight className="size-3.5" />
        </Link>
      )}
    </div>
  );
}
