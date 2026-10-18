import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMoon, faSun } from "@fortawesome/free-solid-svg-icons";
import { T, type Lang } from "../i18n";

type Theme = "light" | "dark";

const THEME_KEY = "finder-theme";
const THEME_COLOR: Record<Theme, string> = { dark: "#0B0908", light: "#FBF5EE" };

export const ROUND_BUTTON =
  "grid h-11 w-11 place-items-center rounded-full border border-line-strong bg-raised text-brand transition hover:border-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand";

function readTheme(): Theme {
  const set = document.documentElement.dataset.theme;
  if (set === "light" || set === "dark") return set;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

interface ThemeToggleProps {
  // Without a language (the opening screen) the label is shown in both.
  lang?: Lang;
}

export default function ThemeToggle({ lang }: ThemeToggleProps) {
  const [theme, setTheme] = useState<Theme>(readTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", THEME_COLOR[theme]);
  }, [theme]);

  const toggle = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {
      // Storage blocked; the theme still switches for this visit.
    }
  };

  const key = theme === "dark" ? "lightMode" : "darkMode";
  const label = lang ? T[lang][key] : `${T.ar[key]} · ${T.en[key]}`;
  return (
    <button type="button" onClick={toggle} aria-label={label} title={label} className={ROUND_BUTTON}>
      <FontAwesomeIcon icon={theme === "dark" ? faSun : faMoon} className="text-lg" aria-hidden="true" />
    </button>
  );
}
