export interface Theme {
  id: string;
  label: string;
  swatch: string; // CSS color for the picker UI
}

export const themes: Theme[] = [
  { id: "zinc", label: "Zinc", swatch: "#71717a" },
  { id: "slate", label: "Slate", swatch: "#64748b" },
  { id: "rose", label: "Rose", swatch: "#f43f5e" },
  { id: "orange", label: "Orange", swatch: "#f97316" },
  { id: "green", label: "Green", swatch: "#22c55e" },
  { id: "blue", label: "Blue", swatch: "#3b82f6" },
  { id: "violet", label: "Violet", swatch: "#8b5cf6" },
  { id: "yellow", label: "Yellow", swatch: "#eab308" },
  { id: "red", label: "Red", swatch: "#ef4444" },
  { id: "cyan", label: "Cyan", swatch: "#06b6d4" },
];

export type ThemeId = (typeof themes)[number]["id"];
export type Mode = "light" | "dark" | "system";

export const THEME_KEY = "react-chat-theme";
export const MODE_KEY = "react-chat-mode";
