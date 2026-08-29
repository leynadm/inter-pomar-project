"use client";

import Image from "next/image";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Link, usePathname, useRouter } from "@/app/i18n/navigation";
import { useState } from "react";

export function Navbar() {
  const t = useTranslations("navigation");
  const pathname = usePathname();
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = [
    { href: "/", label: t("home") },
    { href: "/plantilla", label: t("squad") },
    { href: "/partits", label: t("matches") },
    { href: "/galeria", label: t("gallery") },
  ] as const;

  const locales = [
    { code: "ca", label: "CAT" },
    { code: "es", label: "ESP" },
    { code: "en", label: "ENG" },
  ];

  function handleLocaleSwitch(newLocale: string) {
    router.replace(
      // usePathname() returns the union of every route, including dynamic ones
      // like /plantilla/[slug], which the typed router requires `params` for.
      // The params are only known at runtime, so this cast is the documented
      // next-intl workaround.
      // @ts-expect-error -- runtime params satisfy the dynamic-route signature
      { pathname, params },
      { locale: newLocale }
    );
  }

  function isActive(href: string) {
    return href === "/"
      ? pathname === "/" || pathname === `/${locale}`
      : pathname.startsWith(href);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-night/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
        <Link href="/" className="flex items-center gap-3">
          <Image src="/clear_crest.png" alt="" width={30} height={35} />
          <span className="font-display text-lg font-semibold uppercase tracking-[0.08em] text-chalk">
            Inter Pomar
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive(link.href) ? "page" : undefined}
              className={`relative px-3 py-2 font-display text-sm uppercase tracking-[0.14em] transition-colors ${isActive(link.href)
                ? "text-chalk"
                : "text-chalk-muted hover:text-chalk"
                }`}
            >
              {link.label}
              {isActive(link.href) && (
                <span className="absolute inset-x-3 -bottom-px h-0.5 bg-sand" />
              )}
            </Link>
          ))}

          <div className="ml-5 flex items-center border border-line">
            {locales.map((loc) => (
              <button
                key={loc.code}
                onClick={() => handleLocaleSwitch(loc.code)}
                className={`px-2.5 py-1.5 font-mono text-[0.6875rem] tracking-wider transition-colors ${locale === loc.code
                  ? "bg-club text-chalk"
                  : "text-chalk-faint hover:text-chalk"
                  }`}
              >
                {loc.label}
              </button>
            ))}
          </div>
        </nav>

        <button
          className="flex flex-col gap-1.5 p-1 md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-expanded={mobileOpen}
          aria-label="Menu"
        >
          <span
            className={`h-px w-6 bg-chalk transition-transform ${mobileOpen ? "translate-y-1.75 rotate-45" : ""
              }`}
          />
          <span
            className={`h-px w-6 bg-chalk transition-opacity ${mobileOpen ? "opacity-0" : ""
              }`}
          />
          <span
            className={`h-px w-6 bg-chalk transition-transform ${mobileOpen ? "-translate-y-1.75 -rotate-45" : ""
              }`}
          />
        </button>
      </div>

      {mobileOpen && (
        <nav className="border-t border-line bg-night px-5 pb-5 md:hidden">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={`block border-b border-line py-3.5 font-display text-base uppercase tracking-[0.14em] ${isActive(link.href) ? "text-sand" : "text-chalk-muted"
                }`}
            >
              {link.label}
            </Link>
          ))}
          <div className="mt-4 flex border border-line">
            {locales.map((loc) => (
              <button
                key={loc.code}
                onClick={() => {
                  handleLocaleSwitch(loc.code);
                  setMobileOpen(false);
                }}
                className={`flex-1 py-2 font-mono text-xs ${locale === loc.code
                  ? "bg-club text-chalk"
                  : "text-chalk-faint"
                  }`}
              >
                {loc.label}
              </button>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
