import * as rootParams from "next/root-params";
import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "./routing";
import { notFound } from "next/navigation";

export default getRequestConfig(async () => {
  const paramValue = await rootParams.locale();

  if (!hasLocale(routing.locales, paramValue)) {
    notFound();
  }

  const locale = paramValue;

  const messages = {
    ...(await import(`../../messages/${locale}/common.json`)).default,
    navigation: (await import(`../../messages/${locale}/navigation.json`)).default,
    home: (await import(`../../messages/${locale}/home.json`)).default,
    squad: (await import(`../../messages/${locale}/squad.json`)).default,
    matches: (await import(`../../messages/${locale}/matches.json`)).default,
  };

  return { locale, messages };
});
