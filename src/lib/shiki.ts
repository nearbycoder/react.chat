import bash from "@shikijs/langs/bash";
import css from "@shikijs/langs/css";
import html from "@shikijs/langs/html";
import javascript from "@shikijs/langs/javascript";
import json from "@shikijs/langs/json";
import jsx from "@shikijs/langs/jsx";
import markdown from "@shikijs/langs/markdown";
import python from "@shikijs/langs/python";
import sql from "@shikijs/langs/sql";
import tsx from "@shikijs/langs/tsx";
import typescript from "@shikijs/langs/typescript";
import xml from "@shikijs/langs/xml";
import yaml from "@shikijs/langs/yaml";
import type { HighlighterCore } from "shiki/core";
import { createHighlighterCore } from "shiki/core";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";
import type { BundledTheme } from "shiki/themes";
import type { CodeThemeId } from "./themes";
import { getCodeThemeById } from "./themes";

const HIGHLIGHT_CACHE_LIMIT = 250;
const highlightCache = new Map<string, Promise<string>>();
const loadedThemes = new Set<BundledTheme>();
const supportedLanguages = new Set([
	"bash",
	"css",
	"html",
	"javascript",
	"json",
	"jsx",
	"markdown",
	"python",
	"sql",
	"tsx",
	"typescript",
	"xml",
	"yaml",
]);

const languageAliases: Record<string, string> = {
	cjs: "javascript",
	js: "javascript",
	mjs: "javascript",
	cts: "typescript",
	mts: "typescript",
	ts: "typescript",
	md: "markdown",
	py: "python",
	shell: "bash",
	shellscript: "bash",
	sh: "bash",
	txt: "text",
	yml: "yaml",
};

let highlighterPromise: Promise<HighlighterCore> | null = null;

function escapeHtml(value: string): string {
	return value
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
		.replaceAll('"', "&quot;")
		.replaceAll("'", "&#39;");
}

function fallbackCodeBlock(code: string): string {
	return `<pre class="shiki"><code>${escapeHtml(code)}</code></pre>`;
}

function resolveLanguage(language?: string): string {
	const normalized = language?.trim().toLowerCase();
	if (!normalized) return "text";

	if (normalized === "text" || normalized === "plain" || normalized === "txt") {
		return "text";
	}

	const alias = languageAliases[normalized];
	if (alias) {
		return alias;
	}

	if (supportedLanguages.has(normalized)) {
		return normalized;
	}

	return "text";
}

async function getHighlighter(): Promise<HighlighterCore> {
	if (highlighterPromise) return highlighterPromise;

	highlighterPromise = createHighlighterCore({
		langs: [
			...bash,
			...css,
			...html,
			...javascript,
			...json,
			...jsx,
			...markdown,
			...python,
			...sql,
			...tsx,
			...typescript,
			...xml,
			...yaml,
		],
		themes: [],
		engine: createJavaScriptRegexEngine(),
	});

	return highlighterPromise;
}

async function ensureThemeLoaded(
	highlighter: HighlighterCore,
	theme: BundledTheme,
) {
	if (loadedThemes.has(theme)) return;

	const { loadShikiThemeRegistration } = await import("./shiki-themes");
	const registration = await loadShikiThemeRegistration(theme);
	await highlighter.loadTheme(registration);
	loadedThemes.add(theme);
}

export async function renderShikiCodeBlock(
	code: string,
	language: string | undefined,
	codeThemeId: CodeThemeId,
): Promise<string> {
	const resolvedLanguage = resolveLanguage(language);
	const codeTheme = getCodeThemeById(codeThemeId);
	const cacheKey = `${codeTheme.id}\u0000${resolvedLanguage}\u0000${code}`;
	const cached = highlightCache.get(cacheKey);
	if (cached) return cached;

	const highlighted = getHighlighter()
		.then(async (highlighter) => {
			await ensureThemeLoaded(highlighter, codeTheme.light);
			await ensureThemeLoaded(highlighter, codeTheme.dark);
			return highlighter.codeToHtml(code, {
				lang: resolvedLanguage,
				themes: {
					light: codeTheme.light,
					dark: codeTheme.dark,
				},
				defaultColor: false,
			});
		})
		.catch(() => fallbackCodeBlock(code));

	highlightCache.set(cacheKey, highlighted);
	if (highlightCache.size > HIGHLIGHT_CACHE_LIMIT) {
		highlightCache.clear();
	}

	return highlighted;
}
