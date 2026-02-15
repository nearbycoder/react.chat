import type { BundledTheme } from "shiki/themes";
import { bundledThemesInfo } from "shiki/themes";

type ThemeType = "light" | "dark";

export interface CodeTheme {
	id: BundledTheme;
	label: string;
	type: ThemeType;
	light: BundledTheme;
	dark: BundledTheme;
}

const themeInfoById = new Map(
	bundledThemesInfo.map((info) => [info.id as BundledTheme, info]),
);

const explicitDarkByLight: Partial<Record<BundledTheme, BundledTheme>> = {
	"catppuccin-latte": "catppuccin-mocha",
	"material-theme-lighter": "material-theme",
	"night-owl-light": "night-owl",
	"one-light": "one-dark-pro",
	"rose-pine-dawn": "rose-pine-moon",
};

const explicitLightByDark: Partial<Record<BundledTheme, BundledTheme>> = {
	"catppuccin-frappe": "catppuccin-latte",
	"catppuccin-macchiato": "catppuccin-latte",
	"catppuccin-mocha": "catppuccin-latte",
	"material-theme": "material-theme-lighter",
	"material-theme-darker": "material-theme-lighter",
	"material-theme-ocean": "material-theme-lighter",
	"material-theme-palenight": "material-theme-lighter",
	"night-owl": "night-owl-light",
	"one-dark-pro": "one-light",
	"rose-pine": "rose-pine-dawn",
	"rose-pine-moon": "rose-pine-dawn",
};

function getThemeType(theme: BundledTheme): ThemeType | undefined {
	return themeInfoById.get(theme)?.type;
}

function toBundledTheme(value: string): BundledTheme | null {
	return themeInfoById.has(value as BundledTheme)
		? (value as BundledTheme)
		: null;
}

function findByNameHeuristic(
	theme: BundledTheme,
	targetType: ThemeType,
): BundledTheme | null {
	const candidates =
		targetType === "light"
			? [
					theme.replace("-dark-", "-light-"),
					theme.replace("-dark", "-light"),
					theme.replace("dark", "light"),
				]
			: [
					theme.replace("-light-", "-dark-"),
					theme.replace("-light", "-dark"),
					theme.replace("light", "dark"),
				];

	for (const candidate of candidates) {
		const bundledTheme = toBundledTheme(candidate);
		if (bundledTheme && getThemeType(bundledTheme) === targetType) {
			return bundledTheme;
		}
	}

	return null;
}

function findPairedTheme(
	theme: BundledTheme,
	targetType: ThemeType,
): BundledTheme {
	if (getThemeType(theme) === targetType) return theme;

	const explicit =
		targetType === "light"
			? explicitLightByDark[theme]
			: explicitDarkByLight[theme];
	if (explicit && getThemeType(explicit) === targetType) {
		return explicit;
	}

	const heuristic = findByNameHeuristic(theme, targetType);
	if (heuristic) return heuristic;

	return theme;
}

export const codeThemes: CodeTheme[] = bundledThemesInfo.map((info) => {
	const id = info.id as BundledTheme;
	const type = info.type === "light" ? "light" : "dark";
	const light = info.type === "light" ? id : findPairedTheme(id, "light");
	const dark = info.type === "dark" ? id : findPairedTheme(id, "dark");

	return {
		id,
		label: info.displayName,
		type,
		light,
		dark,
	};
});

export type CodeThemeId = (typeof codeThemes)[number]["id"];
export const CODE_THEME_KEY = "react-chat-code-theme";

const defaultCodeThemeId = "github-dark";
const codeThemeIds = new Set(codeThemes.map((theme) => theme.id));

export function isCodeThemeId(value: string | null): value is CodeThemeId {
	return value !== null && codeThemeIds.has(value as CodeThemeId);
}

export function getDefaultCodeThemeId(): CodeThemeId {
	return defaultCodeThemeId;
}

export function getCodeThemeById(id: CodeThemeId): CodeTheme {
	const found = codeThemes.find((theme) => theme.id === id);
	return found ?? codeThemes[0];
}

export function isDarkCodeTheme(id: CodeThemeId): boolean {
	return getCodeThemeById(id).type === "dark";
}
