"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useServerInsertedHTML } from "next/navigation";
import { Moon, Sun, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type Theme = "light" | "dark" | "system";

const STORAGE_KEY = "inter-pomar-theme";

/**
 * Runs before first paint, so the correct class is on <html> before anything
 * renders. Injected via useServerInsertedHTML rather than rendered as JSX:
 * a <script> inside a client component triggers a React 19 warning and never
 * executes on the client anyway.
 */
const INIT_SCRIPT = `
(function(){try{
var t=localStorage.getItem(${JSON.stringify(STORAGE_KEY)})||"light";
var d=t==="dark"||(t==="system"&&window.matchMedia("(prefers-color-scheme: dark)").matches);
document.documentElement.classList.toggle("dark",d);
document.documentElement.style.colorScheme=d?"dark":"light";
}catch(e){}})();
`.trim();

type ThemeContextValue = {
  theme: Theme;
  resolvedTheme: "light" | "dark";
  setTheme: (theme: Theme) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
  return ctx;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light");
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");

  useServerInsertedHTML(() => (
    <script
      id="theme-init"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: INIT_SCRIPT }}
    />
  ));

  // Pick up whatever the init script already decided.
  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY) as Theme | null;
    if (stored === "light" || stored === "dark" || stored === "system") {
      setThemeState(stored);
    }
  }, []);

  // Apply the class, and follow the OS while on "system".
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");

    const apply = () => {
      const dark = theme === "dark" || (theme === "system" && mq.matches);
      const root = document.documentElement;

      root.classList.add("theme-switching");
      root.classList.toggle("dark", dark);
      root.style.colorScheme = dark ? "dark" : "light";
      setResolvedTheme(dark ? "dark" : "light");

      const id = window.setTimeout(
        () => root.classList.remove("theme-switching"),
        0
      );
      return () => window.clearTimeout(id);
    };

    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [theme]);

  // Keep other tabs in step.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        setThemeState(e.newValue as Theme);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const setTheme = useCallback((next: Theme) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Private mode, quota, whatever — the theme still applies for this session.
    }
    setThemeState(next);
  }, []);

  const value = useMemo(
    () => ({ theme, resolvedTheme, setTheme }),
    [theme, resolvedTheme, setTheme]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function ThemeToggle({
  label,
  labels,
}: {
  label: string;
  labels: { light: string; dark: string; system: string };
}) {
  const { theme, setTheme } = useTheme();

  const options: { value: Theme; icon: React.ReactNode; label: string }[] = [
    { value: "light", icon: <Sun className="size-4" />, label: labels.light },
    { value: "dark", icon: <Moon className="size-4" />, label: labels.dark },
    { value: "system", icon: <Monitor className="size-4" />, label: labels.system },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="icon" aria-label={label}>
            <Sun className="size-4 dark:hidden" />
            <Moon className="hidden size-4 dark:block" />
          </Button>
        }
      />
      <DropdownMenuContent align="end">
        {options.map((o) => (
          <DropdownMenuItem
            key={o.value}
            onClick={() => setTheme(o.value)}
            data-selected={theme === o.value || undefined}
            className="data-[selected]:font-medium"
          >
            {o.icon}
            {o.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
