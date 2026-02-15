import { useCallback, useEffect, useState } from "react";
import type { CodeThemeId } from "../lib/themes";
import {
	CODE_THEME_KEY,
	getDefaultCodeThemeId,
	isCodeThemeId,
	isDarkCodeTheme,
} from "../lib/themes";

interface ThemeState {
	codeTheme: CodeThemeId;
}

const THEME_CHANGE_EVENT = "react-chat-theme-change";

function getStoredCodeTheme(): CodeThemeId {
	if (typeof window === "undefined") return getDefaultCodeThemeId();
	const stored = localStorage.getItem(CODE_THEME_KEY);
	return isCodeThemeId(stored) ? stored : getDefaultCodeThemeId();
}

function getStoredThemeState(): ThemeState {
	return { codeTheme: getStoredCodeTheme() };
}

function emitThemeState(nextState: ThemeState) {
	if (typeof window === "undefined") return;
	window.dispatchEvent(
		new CustomEvent<ThemeState>(THEME_CHANGE_EVENT, { detail: nextState }),
	);
}

function isThemeState(value: unknown): value is ThemeState {
	if (!value || typeof value !== "object") return false;
	const candidate = value as Record<string, unknown>;
	return (
		typeof candidate.codeTheme === "string" &&
		isCodeThemeId(candidate.codeTheme)
	);
}

export function useTheme() {
	const [themeState, setThemeState] = useState<ThemeState>(getStoredThemeState);

	const setCodeTheme = useCallback((codeTheme: CodeThemeId) => {
		localStorage.setItem(CODE_THEME_KEY, codeTheme);
		setThemeState((current) => {
			const next = { ...current, codeTheme };
			emitThemeState(next);
			return next;
		});
	}, []);

	// Sync between hook instances in the same tab and across tabs.
	useEffect(() => {
		const syncFromCustomEvent = (event: Event) => {
			const customEvent = event as CustomEvent<unknown>;
			if (isThemeState(customEvent.detail)) {
				setThemeState(customEvent.detail);
				return;
			}

			setThemeState(getStoredThemeState());
		};

		const syncFromStorageEvent = (event: StorageEvent) => {
			if (event.key === CODE_THEME_KEY || event.key === null) {
				setThemeState(getStoredThemeState());
			}
		};

		window.addEventListener(THEME_CHANGE_EVENT, syncFromCustomEvent);
		window.addEventListener("storage", syncFromStorageEvent);

		return () => {
			window.removeEventListener(THEME_CHANGE_EVENT, syncFromCustomEvent);
			window.removeEventListener("storage", syncFromStorageEvent);
		};
	}, []);

	// The selected Shiki theme controls dark/light mode.
	useEffect(() => {
		const isDark = isDarkCodeTheme(themeState.codeTheme);
		document.documentElement.classList.toggle("dark", isDark);
	}, [themeState.codeTheme]);

	// Apply selected Shiki theme palette to app variables.
	useEffect(() => {
		let cancelled = false;
		const isDark = isDarkCodeTheme(themeState.codeTheme);
		import("../lib/shiki-themes")
			.then(async ({ applyShikiAppTheme }) => {
				if (!cancelled) {
					await applyShikiAppTheme(themeState.codeTheme, isDark);
				}
			})
			.catch(() => {
				// Keep current CSS variables if a theme module fails to load.
			});

		return () => {
			cancelled = true;
		};
	}, [themeState.codeTheme]);

	return {
		codeTheme: themeState.codeTheme,
		setCodeTheme,
	};
}
