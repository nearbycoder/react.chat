import {
	createRootRoute,
	HeadContent,
	Outlet,
	Scripts,
} from "@tanstack/react-router";
import {
	CODE_THEME_KEY,
	codeThemes,
	getDefaultCodeThemeId,
} from "../lib/themes";

import appCss from "../styles.css?url";

export const Route = createRootRoute({
	head: () => ({
		meta: [
			{
				charSet: "utf-8",
			},
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			{
				title: "React Chat",
			},
		],
		links: [
			{
				rel: "icon",
				type: "image/svg+xml",
				href: "/favicon.svg",
			},
			{
				rel: "stylesheet",
				href: appCss,
			},
		],
	}),
	component: RootDocument,
});

const themeModeById = Object.fromEntries(
	codeThemes.map((theme) => [theme.id, theme.type]),
);
const defaultThemeId = getDefaultCodeThemeId();

const themeScript = `(function(){try{var key=${JSON.stringify(CODE_THEME_KEY)};var modeById=${JSON.stringify(themeModeById)};var fallback=${JSON.stringify(defaultThemeId)};var stored=localStorage.getItem(key);var mode=modeById[stored||""]||modeById[fallback]||"dark";document.documentElement.classList.toggle("dark",mode==="dark")}catch(e){}})()`;

function RootDocument() {
	return (
		<html lang="en">
			<head>
				<HeadContent />
				{/* biome-ignore lint/security/noDangerouslySetInnerHtml: Static inline script applies initial dark class from selected code theme. */}
				<script dangerouslySetInnerHTML={{ __html: themeScript }} />
			</head>
			<body>
				<Outlet />
				<Scripts />
			</body>
		</html>
	);
}
