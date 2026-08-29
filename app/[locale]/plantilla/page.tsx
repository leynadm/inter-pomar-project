import { getTranslations } from "next-intl/server";
import { getSquadWithStats } from "@/sanity/lib/queries";
import { positions } from "@/lib/football-constants";
import { PlayerCard, type PlayerCardData } from "@/components/player-card";

const positionZone = Object.fromEntries(positions.map((p) => [p.value, p.zone]));

const ZONES = ["goalkeeper", "defence", "midfield", "attack"] as const;

const ZONE_LABELS: Record<string, Record<string, string>> = {
  goalkeeper: { ca: "Porters", es: "Porteros", en: "Goalkeepers" },
  defence: { ca: "Defenses", es: "Defensas", en: "Defenders" },
  midfield: { ca: "Migcampistes", es: "Centrocampistas", en: "Midfielders" },
  attack: { ca: "Davanters", es: "Delanteros", en: "Forwards" },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "squad.meta" });
  return { title: t("title"), description: t("description") };
}

export default async function SquadPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("squad");
  const tPos = await getTranslations("positions");
  const tStats = await getTranslations("stats");
  const players = (await getSquadWithStats()) as PlayerCardData[];

  const statLabels = {
    appearances: tStats("appearances"),
    goals: tStats("goals"),
    assists: tStats("assists"),
  };

  const grouped = ZONES.map((zone) => ({
    zone,
    label: ZONE_LABELS[zone][locale] ?? zone,
    players: players.filter((p) => positionZone[p.position] === zone),
  })).filter((g) => g.players.length > 0);

  return (
    <main>
      <section className="relative overflow-hidden pb-10 pt-28">
        <div className="mow-soft absolute inset-0" aria-hidden />
        <div className="relative mx-auto max-w-6xl px-5">
          <p className="label text-pitch">
            {players.length} {locale === "en" ? "players" : "jugadors"}
          </p>
          <h1 className="display mt-2 text-4xl sm:text-6xl">{t("title")}</h1>
        </div>
      </section>

      <div className="mx-auto max-w-6xl space-y-14 px-5 py-14">
        {grouped.map((group) => (
          <section key={group.zone}>
            <div className="mb-5 flex items-baseline gap-3">
              <h2 className="display flex items-center gap-3 text-2xl sm:text-3xl">
                <span className="h-5 w-1.5 shrink-0 bg-pitch" aria-hidden />
                {group.label}
              </h2>
              <span className="numeric text-sm text-muted-foreground">
                {group.players.length}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {group.players.map((player) => (
                <PlayerCard
                  key={player._id}
                  player={player}
                  positionLabel={tPos(player.position)}
                  statLabels={statLabels}
                />
              ))}
            </div>
          </section>
        ))}

        {grouped.length === 0 && (
          <p className="py-16 text-center text-muted-foreground">
            {locale === "ca"
              ? "Encara no hi ha jugadors publicats."
              : locale === "es"
                ? "Todavía no hay jugadores publicados."
                : "No players published yet."}
          </p>
        )}
      </div>
    </main>
  );
}
