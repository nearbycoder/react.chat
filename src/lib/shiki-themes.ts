import type { ThemeRegistrationAny } from "shiki";
import type { BundledTheme } from "shiki/themes";
import { bundledThemes } from "shiki/themes";
import type { CodeThemeId } from "./themes";
import { getCodeThemeById } from "./themes";

interface AppPalette {
	background: string;
	foreground: string;
	card: string;
	"card-foreground": string;
	popover: string;
	"popover-foreground": string;
	primary: string;
	"primary-foreground": string;
	secondary: string;
	"secondary-foreground": string;
	muted: string;
	"muted-foreground": string;
	accent: string;
	"accent-foreground": string;
	destructive: string;
	"destructive-foreground": string;
	border: string;
	input: string;
	ring: string;
	"chart-1": string;
	"chart-2": string;
	"chart-3": string;
	"chart-4": string;
	"chart-5": string;
	sidebar: string;
	"sidebar-foreground": string;
	"sidebar-primary": string;
	"sidebar-primary-foreground": string;
	"sidebar-accent": string;
	"sidebar-accent-foreground": string;
	"sidebar-border": string;
	"sidebar-ring": string;
}

const themeRegistrationCache = new Map<
	BundledTheme,
	Promise<ThemeRegistrationAny>
>();
const paletteCache = new Map<BundledTheme, Promise<AppPalette>>();
const swatchCache = new Map<BundledTheme, Promise<string[]>>();

function normalizeThemeModule(value: unknown): ThemeRegistrationAny {
	if (value && typeof value === "object" && "default" in value) {
		return (value as { default: ThemeRegistrationAny }).default;
	}
	return value as ThemeRegistrationAny;
}

export function loadShikiThemeRegistration(
	theme: BundledTheme,
): Promise<ThemeRegistrationAny> {
	const cached = themeRegistrationCache.get(theme);
	if (cached) return cached;

	const loader = bundledThemes[theme];
	const registration = (loader ? loader() : bundledThemes["github-dark"]())
		.then(normalizeThemeModule)
		.catch(async () =>
			normalizeThemeModule(await bundledThemes["github-dark"]()),
		);

	themeRegistrationCache.set(theme, registration);
	return registration;
}

function pickColor(
	colors: Record<string, string>,
	keys: string[],
	fallback: string,
): string {
	for (const key of keys) {
		const value = colors[key];
		if (value) return value;
	}

	return fallback;
}

async function buildPalette(theme: BundledTheme): Promise<AppPalette> {
	const cached = paletteCache.get(theme);
	if (cached) return cached;

	const palettePromise = loadShikiThemeRegistration(theme).then(
		(registration) => {
			const colors = registration.colors ?? {};
			const background = pickColor(
				colors,
				["editor.background", "sideBar.background", "panel.background"],
				"#111827",
			);
			const foreground = pickColor(
				colors,
				["editor.foreground", "foreground", "sideBar.foreground"],
				"#f8fafc",
			);
			const card = pickColor(
				colors,
				["panel.background", "editorWidget.background", "sideBar.background"],
				background,
			);
			const cardForeground = pickColor(
				colors,
				[
					"editor.foreground",
					"panelTitle.activeForeground",
					"sideBar.foreground",
				],
				foreground,
			);
			const popover = pickColor(
				colors,
				["editorWidget.background", "dropdown.background", "panel.background"],
				card,
			);
			const popoverForeground = pickColor(
				colors,
				["dropdown.foreground", "editor.foreground", "sideBar.foreground"],
				foreground,
			);
			const primary = pickColor(
				colors,
				[
					"button.background",
					"textLink.activeForeground",
					"textLink.foreground",
					"terminal.ansiBlue",
					"terminal.ansiCyan",
					"editorCursor.foreground",
					"editor.selectionBackground",
				],
				foreground,
			);
			const primaryForeground = pickColor(
				colors,
				[
					"button.foreground",
					"editor.background",
					"sideBar.background",
					"foreground",
				],
				background,
			);
			const secondary = pickColor(
				colors,
				[
					"sideBar.background",
					"tab.inactiveBackground",
					"editor.lineHighlightBackground",
				],
				card,
			);
			const secondaryForeground = pickColor(
				colors,
				["sideBar.foreground", "tab.inactiveForeground", "editor.foreground"],
				foreground,
			);
			const muted = pickColor(
				colors,
				[
					"editor.lineHighlightBackground",
					"tab.inactiveBackground",
					"list.hoverBackground",
				],
				secondary,
			);
			const mutedForeground = pickColor(
				colors,
				[
					"descriptionForeground",
					"tab.inactiveForeground",
					"editorLineNumber.foreground",
				],
				secondaryForeground,
			);
			const accent = pickColor(
				colors,
				[
					"list.hoverBackground",
					"list.activeSelectionBackground",
					"tab.hoverBackground",
				],
				muted,
			);
			const accentForeground = pickColor(
				colors,
				[
					"list.activeSelectionForeground",
					"list.hoverForeground",
					"editor.foreground",
				],
				foreground,
			);
			const destructive = pickColor(
				colors,
				["errorForeground", "editorError.foreground", "terminal.ansiRed"],
				"#ef4444",
			);
			const destructiveForeground = pickColor(
				colors,
				["editor.background", "panel.background"],
				background,
			);
			const border = pickColor(
				colors,
				[
					"panel.border",
					"editorGroup.border",
					"sideBar.border",
					"dropdown.border",
					"input.border",
				],
				"#334155",
			);
			const input = pickColor(
				colors,
				["input.background", "dropdown.background", "editorWidget.background"],
				card,
			);
			const ring = pickColor(
				colors,
				["focusBorder", "textLink.activeForeground", "editorCursor.foreground"],
				primary,
			);
			const sidebar = pickColor(
				colors,
				["sideBar.background", "editor.background", "panel.background"],
				background,
			);
			const sidebarForeground = pickColor(
				colors,
				["sideBar.foreground", "editor.foreground"],
				foreground,
			);
			const sidebarPrimary = pickColor(
				colors,
				[
					"activityBarBadge.background",
					"button.background",
					"textLink.foreground",
				],
				primary,
			);
			const sidebarPrimaryForeground = pickColor(
				colors,
				[
					"activityBarBadge.foreground",
					"button.foreground",
					"editor.background",
				],
				primaryForeground,
			);
			const sidebarAccent = pickColor(
				colors,
				[
					"list.hoverBackground",
					"list.inactiveSelectionBackground",
					"tab.inactiveBackground",
				],
				accent,
			);
			const sidebarAccentForeground = pickColor(
				colors,
				[
					"list.hoverForeground",
					"list.activeSelectionForeground",
					"editor.foreground",
				],
				accentForeground,
			);
			const sidebarBorder = pickColor(
				colors,
				["sideBar.border", "panel.border", "editorGroup.border"],
				border,
			);
			const sidebarRing = ring;

			return {
				background,
				foreground,
				card,
				"card-foreground": cardForeground,
				popover,
				"popover-foreground": popoverForeground,
				primary,
				"primary-foreground": primaryForeground,
				secondary,
				"secondary-foreground": secondaryForeground,
				muted,
				"muted-foreground": mutedForeground,
				accent,
				"accent-foreground": accentForeground,
				destructive,
				"destructive-foreground": destructiveForeground,
				border,
				input,
				ring,
				"chart-1": pickColor(
					colors,
					["terminal.ansiBlue", "textLink.foreground"],
					primary,
				),
				"chart-2": pickColor(
					colors,
					["terminal.ansiGreen", "button.background"],
					primary,
				),
				"chart-3": pickColor(
					colors,
					["terminal.ansiYellow", "editorWarning.foreground"],
					primary,
				),
				"chart-4": pickColor(
					colors,
					["terminal.ansiMagenta", "badge.background"],
					primary,
				),
				"chart-5": pickColor(
					colors,
					["terminal.ansiCyan", "editorCursor.foreground"],
					primary,
				),
				sidebar,
				"sidebar-foreground": sidebarForeground,
				"sidebar-primary": sidebarPrimary,
				"sidebar-primary-foreground": sidebarPrimaryForeground,
				"sidebar-accent": sidebarAccent,
				"sidebar-accent-foreground": sidebarAccentForeground,
				"sidebar-border": sidebarBorder,
				"sidebar-ring": sidebarRing,
			};
		},
	);

	paletteCache.set(theme, palettePromise);
	return palettePromise;
}

async function buildSwatches(theme: BundledTheme): Promise<string[]> {
	const cached = swatchCache.get(theme);
	if (cached) return cached;

	const swatchPromise = loadShikiThemeRegistration(theme).then(
		(registration) => {
			const colors = registration.colors ?? {};
			const background = pickColor(
				colors,
				["editor.background", "sideBar.background", "panel.background"],
				"#111827",
			);
			const foreground = pickColor(
				colors,
				["editor.foreground", "sideBar.foreground"],
				"#f8fafc",
			);
			const primary = pickColor(
				colors,
				[
					"button.background",
					"textLink.activeForeground",
					"textLink.foreground",
					"terminal.ansiBlue",
					"editorCursor.foreground",
				],
				foreground,
			);
			const accent = pickColor(
				colors,
				[
					"list.activeSelectionBackground",
					"list.hoverBackground",
					"tab.activeBorder",
					"terminal.ansiMagenta",
				],
				primary,
			);

			return [background, foreground, primary, accent];
		},
	);

	swatchCache.set(theme, swatchPromise);
	return swatchPromise;
}

export async function applyShikiAppTheme(
	codeThemeId: CodeThemeId,
	isDark: boolean,
	root: HTMLElement = document.documentElement,
) {
	const codeTheme = getCodeThemeById(codeThemeId);
	const selectedTheme = isDark ? codeTheme.dark : codeTheme.light;
	const palette = await buildPalette(selectedTheme);

	for (const [name, value] of Object.entries(palette)) {
		root.style.setProperty(`--${name}`, value);
	}
}

export async function getShikiThemeSwatches(
	theme: BundledTheme,
): Promise<string[]> {
	return buildSwatches(theme);
}
