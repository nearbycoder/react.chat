import { useState, useEffect, useCallback } from "react";
import { THEME_KEY, MODE_KEY } from "../lib/themes";
import type { ThemeId, Mode } from "../lib/themes";

function getStoredTheme(): ThemeId {
  if (typeof window === "undefined") return "zinc";
  return (localStorage.getItem(THEME_KEY) as ThemeId) || "zinc";
}

function getStoredMode(): Mode {
  if (typeof window === "undefined") return "system";
  return (localStorage.getItem(MODE_KEY) as Mode) || "system";
}

function applyTheme(theme: ThemeId) {
  const el = document.documentElement;
  if (theme === "zinc") {
    delete el.dataset.theme;
  } else {
    el.dataset.theme = theme;
  }
}

function applyMode(mode: Mode) {
  const el = document.documentElement;
  if (mode === "dark") {
    el.classList.add("dark");
  } else if (mode === "light") {
    el.classList.remove("dark");
  } else {
    // system
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;
    el.classList.toggle("dark", prefersDark);
  }
}

export function useTheme() {
  const [theme, setThemeState] = useState<ThemeId>(getStoredTheme);
  const [mode, setModeState] = useState<Mode>(getStoredMode);

  const setTheme = useCallback((t: ThemeId) => {
    setThemeState(t);
    localStorage.setItem(THEME_KEY, t);
    applyTheme(t);
  }, []);

  const setMode = useCallback((m: Mode) => {
    setModeState(m);
    localStorage.setItem(MODE_KEY, m);
    applyMode(m);
  }, []);

  // Apply on mount
  useEffect(() => {
    applyTheme(theme);
    applyMode(mode);
  }, [theme, mode]);

  // Listen for system preference changes when in "system" mode
  useEffect(() => {
    if (mode !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e: MediaQueryListEvent) => {
      document.documentElement.classList.toggle("dark", e.matches);
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [mode]);

  return { theme, mode, setTheme, setMode };
}
