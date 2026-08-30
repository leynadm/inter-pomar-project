import { createNavigation } from "next-intl/navigation";
import { defineRouting } from "next-intl/routing";
import type { ComponentProps } from "react";

export const routing = defineRouting({
  locales: ["ca", "es", "en"],
  defaultLocale: "ca",
});

const {
  Link: NextIntlLink,
  redirect,
  usePathname,
  useRouter,
  getPathname,
} = createNavigation(routing);

export function Link({
  prefetch = false,
  ...props
}: ComponentProps<typeof NextIntlLink>) {
  return <NextIntlLink prefetch={prefetch} {...props} />;
}

export { redirect, usePathname, useRouter, getPathname };
