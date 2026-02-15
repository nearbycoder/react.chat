import { useEffect, useRef } from "react";
import hljs from "highlight.js";
import "highlight.js/styles/github-dark.css";

interface CodeBlockProps {
	text: string;
	language?: string;
}

export function CodeBlock({ text, language }: CodeBlockProps) {
	const codeRef = useRef<HTMLElement>(null);

	useEffect(() => {
		if (codeRef.current) {
			hljs.highlightElement(codeRef.current);
		}
	}, [text, language]);

	return (
		<pre className="rounded-md overflow-x-auto my-1">
			<code ref={codeRef} className={language ? `language-${language}` : ""}>
				{text}
			</code>
		</pre>
	);
}
