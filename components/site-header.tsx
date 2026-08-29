"use client";

import Image from "next/image";
import { useState } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Link, usePathname, useRouter } from "@/app/i18n/navigation";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const LOCALES = [
  { code: "ca", label: "CA" },
  { code: "es", label: "ES" },
  { code: "en", label: "EN" },
];

export function SiteHeader() {
  const t = useTranslations("navigation");
  const pathname = usePathname();
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const [open, setOpen] = useState(false);

  const onHome = pathname === "/" || pathname === `/${locale}`;

  const links = [
    { href: "/" as const, label: t("home") },
    { href: "/plantilla" as const, label: t("squad") },
    { href: "/partits" as const, label: t("matches") },
    { href: "/galeria" as const, label: t("gallery") },
  ];

  function switchLocale(next: string) {
    router.replace(
      // @ts-expect-error -- runtime params satisfy the dynamic-route signature
      { pathname, params },
      { locale: next },
    );
  }

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-neutral-200 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3">
          <Image src="/crest.png" alt="" width={30} height={35} />
          <span className="display text-lg text-pitch">Inter Pomar</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-7 md:flex">
          {links.map((l) => {
            const active =
              l.href === "/" ? onHome : pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "display pb-0.5 text-sm tracking-widest transition-colors",
                  active
                    ? "border-b-2 border-pitch text-pitch"
                    : "text-neutral-600 hover:text-pitch",
                )}
              >
                {l.label}
              </Link>
            );
          })}

          {/* Language switcher */}
          <div className="ml-2 flex items-center gap-1 text-xs text-neutral-400">
            {LOCALES.map((l, i) => (
              <span key={l.code} className="flex items-center">
                {i > 0 && <span className="mx-1">·</span>}
                <button
                  onClick={() => switchLocale(l.code)}
                  className={cn(
                    "font-medium transition-colors",
                    locale === l.code
                      ? "text-pitch"
                      : "text-neutral-400 hover:text-neutral-700",
                  )}
                >
                  {l.label}
                </button>
              </span>
            ))}
          </div>
        </nav>

        {/* Mobile menu */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                aria-label="Menu"
              >
                <Menu className="size-5" />
              </Button>
            }
          />
          <SheetContent side="right" className="w-72 bg-white">
            <SheetTitle className="sr-only">Inter Pomar</SheetTitle>

            <div className="mt-8 flex items-center gap-3 px-4">
              <Image src="/crest.png" alt="" width={28} height={33} />
              <span className="display text-base text-pitch">Inter Pomar</span>
            </div>

            <nav className="mt-8 flex flex-col gap-1 px-4">
              {links.map((l) => {
                const active =
                  l.href === "/" ? onHome : pathname.startsWith(l.href);
                return (
                  <Link
                    key={l.href}
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "display rounded-lg px-3 py-2.5 text-sm tracking-widest transition-colors",
                      active
                        ? "bg-green-50 text-pitch"
                        : "text-neutral-600 hover:bg-neutral-100",
                    )}
                  >
                    {l.label}
                  </Link>
                );
              })}
            </nav>

            <div className="mt-8 flex items-center gap-2 px-7">
              {LOCALES.map((l) => (
                <button
                  key={l.code}
                  onClick={() => {
                    switchLocale(l.code);
                    setOpen(false);
                  }}
                  className={cn(
                    "display rounded-md px-3 py-1.5 text-xs tracking-widest transition-colors",
                    locale === l.code
                      ? "bg-pitch text-white"
                      : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200",
                  )}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
