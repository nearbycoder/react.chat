export type Command =
	| { type: "chat"; text: string }
	| { type: "nick"; nick: string }
	| { type: "color"; color: string }
	| { type: "theme"; themeId: string | null }
	| { type: "giphy"; query: string }
	| { type: "list" }
	| { type: "pm"; to: string; text: string }
	| { type: "code"; text: string; language?: string }
	| { type: "clear" }
	| { type: "help" };

export function parseInput(input: string): Command {
	const trimmed = input.trim();

	if (trimmed.startsWith("/nick ")) {
		const nick = trimmed.slice(6).trim();
		return { type: "nick", nick };
	}

	if (trimmed.startsWith("/color ")) {
		const color = trimmed.slice(7).trim();
		return { type: "color", color };
	}

	if (trimmed === "/theme") {
		return { type: "theme", themeId: null };
	}

	if (trimmed.startsWith("/theme ")) {
		const themeId = trimmed.slice(7).trim();
		return { type: "theme", themeId: themeId || null };
	}

	if (trimmed.startsWith("/giphy ")) {
		const query = trimmed.slice(7).trim();
		return { type: "giphy", query };
	}

	if (trimmed === "/list") {
		return { type: "list" };
	}

	if (trimmed.startsWith("/pm ")) {
		const rest = trimmed.slice(4).trim();
		const match = rest.match(/^@(\S+)\s+(.+)/);
		if (match) {
			return { type: "pm", to: match[1], text: match[2] };
		}
		return { type: "chat", text: trimmed };
	}

	if (trimmed === "/clear") {
		return { type: "clear" };
	}

	if (trimmed === "/help") {
		return { type: "help" };
	}

	if (trimmed.startsWith("!code ")) {
		const text = trimmed.slice(6);
		return { type: "code", text };
	}

	// Detect ```language fenced code blocks
	const fenceMatch = trimmed.match(/^```(\w*)\n([\s\S]*?)```$/);
	if (fenceMatch) {
		const language = fenceMatch[1] || undefined;
		const code = fenceMatch[2];
		return { type: "code", text: code, language };
	}

	return { type: "chat", text: trimmed };
}
