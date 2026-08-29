import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["ca", "es", "en"],
  defaultLocale: "ca",
  pathnames: {
    "/": "/",
    "/plantilla": {
      ca: "/plantilla",
      es: "/plantilla",
      en: "/squad",
    },
    "/plantilla/[slug]": {
      ca: "/plantilla/[slug]",
      es: "/plantilla/[slug]",
      en: "/squad/[slug]",
    },
    "/partits": {
      ca: "/partits",
      es: "/partidos",
      en: "/matches",
    },
    "/partits/[id]": {
      ca: "/partits/[id]",
      es: "/partidos/[id]",
      en: "/matches/[id]",
    },
    "/galeria": {
      ca: "/galeria",
      es: "/galeria",
      en: "/gallery",
    },
    "/club": {
      ca: "/club",
      es: "/club",
      en: "/club",
    },

  },
});

export type Pathnames = keyof typeof routing.pathnames;
export type Locale = (typeof routing.locales)[number];
