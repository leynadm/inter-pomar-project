import Image from "next/image";
import { StripeRail } from "@/components/stripe-rail";
const COPY = {
  ca: {
    eyebrow: "Badalona · Fundat el 2024",
    title: "El club",
    lede: "Inter Pomar és un equip de veterans nascut al barri del Pomar. Juguem a la lliga sènior +30 i, sobretot, juguem cada diumenge.",
    blocks: [
      {
        h: "Com vam començar",
        p: "Un grup d'amics que feia anys que jugava plegat va decidir inscriure's a la lliga el 2024. El nom ve del barri; l'escut, de la samarreta que ja portàvem.",
      },
      {
        h: "On juguem",
        p: "Disputem els partits com a locals a Badalona. Les adreces i horaris de cada jornada són al calendari.",
      },
      {
        h: "Vols jugar-hi?",
        p: "Busquem jugadors de més de 30 anys amb ganes de competir i de quedar-se a fer el tercer temps. Escriu-nos.",
      },
    ],
  },
  es: {
    eyebrow: "Badalona · Fundado en 2024",
    title: "El club",
    lede: "Inter Pomar es un equipo de veteranos nacido en el barrio de Pomar. Jugamos en la liga sénior +30 y, sobre todo, jugamos cada domingo.",
    blocks: [
      {
        h: "Cómo empezamos",
        p: "Un grupo de amigos que llevaba años jugando junto decidió inscribirse en la liga en 2024. El nombre viene del barrio; el escudo, de la camiseta que ya llevábamos.",
      },
      {
        h: "Dónde jugamos",
        p: "Disputamos los partidos como locales en Badalona. Las direcciones y horarios de cada jornada están en el calendario.",
      },
      {
        h: "¿Quieres jugar?",
        p: "Buscamos jugadores de más de 30 años con ganas de competir y de quedarse al tercer tiempo. Escríbenos.",
      },
    ],
  },
  en: {
    eyebrow: "Badalona · Founded 2024",
    title: "The club",
    lede: "Inter Pomar is a veterans' side from the Pomar neighbourhood of Badalona. We play in the over-30s senior league and, more to the point, we play every Sunday.",
    blocks: [
      {
        h: "How it started",
        p: "A group of friends who had been playing together for years entered the league in 2024. The name comes from the neighbourhood; the crest, from the shirt we were already wearing.",
      },
      {
        h: "Where we play",
        p: "Home matches are played in Badalona. Addresses and kick-off times for each matchday are on the fixtures page.",
      },
      {
        h: "Want to play?",
        p: "We're looking for players over 30 who want to compete and stick around afterwards. Get in touch.",
      },
    ],
  },
} as const;

export default async function ClubPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const c = COPY[locale as keyof typeof COPY] ?? COPY.en;

  return (
    <main>
      <section className="floodlight relative overflow-hidden text-chalk">
        <div className="kit-stripes absolute inset-0" aria-hidden />
        <div className="absolute inset-x-0 bottom-0" aria-hidden>
          <StripeRail height={72} />
        </div>
        <div className="relative mx-auto max-w-6xl px-5 pb-20 pt-14">
          <p className="eyebrow text-chalk/50">{c.eyebrow}</p>
          <h1 className="headline mt-3 text-5xl sm:text-7xl">{c.title}</h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-chalk/80">
            {c.lede}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16">
        <div className="grid gap-px border border-line bg-line sm:grid-cols-3">
          {c.blocks.map((b) => (
            <article key={b.h} className="bg-panel p-6">
              <h2 className="headline text-xl text-chalk">{b.h}</h2>
              <p className="mt-3 text-sm leading-relaxed text-chalk-muted">
                {b.p}
              </p>
            </article>
          ))}
        </div>

        <div className="mt-14 flex items-center gap-6 border-t border-line pt-10">
          <Image src="/clear_crest.png" alt="" width={72} height={84} />
          <p className="max-w-sm font-mono text-xs leading-relaxed text-chalk-faint">
            {locale === "ca"
              ? "L'escut recull les franges verticals de la samarreta i l'any de fundació."
              : locale === "es"
                ? "El escudo recoge las franjas verticales de la camiseta y el año de fundación."
                : "The crest carries the shirt's vertical stripes and the founding year."}
          </p>
        </div>
      </section>
    </main>
  );
}
