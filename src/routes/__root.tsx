import {
	HeadContent,
	Outlet,
	Scripts,
	createRootRoute,
} from "@tanstack/react-router";

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

const themeScript = `(function(){try{var t=localStorage.getItem("react-chat-theme");var m=localStorage.getItem("react-chat-mode");if(t&&t!=="zinc")document.documentElement.dataset.theme=t;if(m==="light")document.documentElement.classList.remove("dark");else if(m==="dark")document.documentElement.classList.add("dark");else{if(window.matchMedia("(prefers-color-scheme:dark)").matches)document.documentElement.classList.add("dark");else document.documentElement.classList.remove("dark")}}catch(e){}})()`;

function RootDocument() {
	return (
		<html lang="en">
			<head>
				<HeadContent />
				<script dangerouslySetInnerHTML={{ __html: themeScript }} />
			</head>
			<body>
				<Outlet />
				<Scripts />
			</body>
		</html>
	);
}
