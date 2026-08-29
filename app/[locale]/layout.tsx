import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations } from "next-intl/server";
import { routing } from "../i18n/routing";
import { notFound } from "next/navigation";
import { Archivo, Newsreader, Oswald } from "next/font/google";
import Image from "next/image";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { Link } from "../i18n/navigation";

const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
  display: "swap",
});

const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-newsreader",
  display: "swap",
  style: ["normal", "italic"],
});

const oswald = Oswald({
  subsets: ["latin"],
  variable: "--font-oswald",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "home.meta" });
  return { title: t("title"), description: t("description") };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  return (
    <html
      lang={locale}
      className={`${archivo.variable} ${newsreader.variable} ${oswald.variable}`}
    >
      <body className="min-h-svh font-sans antialiased">
        <NextIntlClientProvider>
          <SiteHeader />
          {children}
          <Footer locale={locale} />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Footer — design-system spec: bg-neutral-900, 4-col grid, Oswald headings
   ═══════════════════════════════════════════════════════════════════════════ */

function Footer({ locale }: { locale: string }) {
  const t = (obj: { ca: string; es: string; en: string }) =>
    locale === "ca" ? obj.ca : locale === "es" ? obj.es : obj.en;

  const clubLinks = [
    { href: "/" as const, label: t({ ca: "Inici", es: "Inicio", en: "Home" }) },
    {
      href: "/plantilla" as const,
      label: t({ ca: "Plantilla", es: "Plantilla", en: "Squad" }),
    },
    {
      href: "/partits" as const,
      label: t({ ca: "Partits", es: "Partidos", en: "Matches" }),
    },
    {
      href: "/galeria" as const,
      label: t({ ca: "Galeria", es: "Galería", en: "Gallery" }),
    },
  ];

  const seasonLinks = [
    {
      href: "/partits" as const,
      label: t({ ca: "Calendari", es: "Calendario", en: "Calendar" }),
    },
    {
      href: "/club" as const,
      label: t({ ca: "El club", es: "El club", en: "The club" }),
    },
  ];

  return (
    <footer className="bg-neutral-900 text-white">
      <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand column */}
          <div>
            <div className="flex items-center gap-3">
              <Image
                src="/crest.png"
                alt=""
                width={32}
                height={37}
                className="brightness-150"
              />
              <span className="display text-base text-white">Inter Pomar</span>
            </div>
            <p className="mt-3 text-[13px] leading-relaxed text-neutral-400">
              {t({
                ca: "Club de futbol amateur de Badalona.\nFundat el 2024. Lliga de veterans +30.",
                es: "Club de fútbol amateur de Badalona.\nFundado en 2024. Liga de veteranos +30.",
                en: "Amateur football club from Badalona.\nFounded in 2024. Senior 30+ league.",
              })}
            </p>
          </div>

          {/* Club links */}
          <nav>
            <p className="display text-xs tracking-widest text-neutral-500">
              Club
            </p>
            <ul className="mt-3 space-y-2">
              {clubLinks.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-[13px] text-neutral-300 transition-colors hover:text-white"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Season links */}
          <nav>
            <p className="display text-xs tracking-widest text-neutral-500">
              {t({
                ca: "Temporada",
                es: "Temporada",
                en: "Season",
              })}
            </p>
            <ul className="mt-3 space-y-2">
              {seasonLinks.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-[13px] text-neutral-300 transition-colors hover:text-white"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Location */}
          <div>
            <p className="display text-xs tracking-widest text-neutral-500">
              {t({ ca: "Ubicació", es: "Ubicación", en: "Location" })}
            </p>
            <p className="mt-3 text-[13px] text-neutral-300">
              Badalona, Barcelona
            </p>
          </div>
        </div>

        <div className="mt-10 flex items-center justify-between border-t border-neutral-700 pt-6">
          <p className="text-xs text-neutral-500">
            © 2024–{new Date().getFullYear()} Inter Pomar CF
          </p>
          <p className="text-xs text-neutral-500">Badalona, Barcelona</p>
        </div>
      </div>
    </footer>
  );
}
