import { useEffect, useState } from "react";
import { useTheme } from "../../hooks/useTheme";

interface CodeBlockProps {
	text: string;
	language?: string;
}

export function CodeBlock({ text, language }: CodeBlockProps) {
	const { codeTheme } = useTheme();
	const [html, setHtml] = useState("");

	useEffect(() => {
		let cancelled = false;
		setHtml("");

		import("../../lib/shiki").then(({ renderShikiCodeBlock }) => {
			renderShikiCodeBlock(text, language, codeTheme).then((nextHtml) => {
				if (!cancelled) {
					setHtml(nextHtml);
				}
			});
		});

		return () => {
			cancelled = true;
		};
	}, [text, language, codeTheme]);

	if (!html) {
		return (
			<pre className="my-1 max-w-full max-h-[60vh] overflow-auto rounded-md border border-border bg-card">
				<code className="block p-3 text-sm whitespace-pre">{text}</code>
			</pre>
		);
	}

	return (
		<div
			className="my-1 max-w-full max-h-[60vh] overflow-auto rounded-md border border-border text-sm [&>pre]:m-0 [&>pre]:p-3"
			// biome-ignore lint/security/noDangerouslySetInnerHtml: Shiki escapes code input and returns controlled token markup.
			dangerouslySetInnerHTML={{ __html: html }}
		/>
	);
}
