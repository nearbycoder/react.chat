import { Send } from "lucide-react";
import {
	type KeyboardEvent,
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import type { ClientMessage } from "../../../server/lib/message-types";
import { useChatDispatch, useChatState } from "../../hooks/useChatStore";
import { useMessageHistory } from "../../hooks/useMessageHistory";
import { useTheme } from "../../hooks/useTheme";
import { parseInput } from "../../lib/commands";
import { codeThemes, getCodeThemeById, isCodeThemeId } from "../../lib/themes";
import { Button } from "../ui/button";

const COMMANDS = [
	{ cmd: "/nick", args: "<name>", desc: "Change nickname" },
	{ cmd: "/color", args: "<color>", desc: "Change message color" },
	{ cmd: "/theme", args: "<theme>", desc: "Change app theme" },
	{ cmd: "/pm", args: "@user message", desc: "Private message" },
	{ cmd: "/giphy", args: "<query>", desc: "Send a GIF" },
	{ cmd: "/list", args: "", desc: "Refresh user list" },
	{ cmd: "/clear", args: "", desc: "Clear messages" },
	{ cmd: "/help", args: "", desc: "Show all commands" },
	{ cmd: "!code", args: "<text>", desc: "Code block" },
];

interface CompletionItem {
	id: string;
	insertText: string;
	primary: string;
	secondary?: string;
	monospace?: boolean;
	desc: string;
}

interface ChatInputProps {
	onSend: (msg: ClientMessage) => void;
}

export function ChatInput({ onSend }: ChatInputProps) {
	const [text, setText] = useState("");
	const [selectedIndex, setSelectedIndex] = useState(0);
	const { connected } = useChatState();
	const dispatch = useChatDispatch();
	const { setCodeTheme } = useTheme();
	const { navigateHistory, resetHistory } = useMessageHistory();
	const textareaRef = useRef<HTMLTextAreaElement>(null);

	// Auto-resize textarea
	useEffect(() => {
		void text;
		const el = textareaRef.current;
		if (!el) return;
		el.style.height = "0";
		el.style.height = `${Math.min(el.scrollHeight, 150)}px`;
	}, [text]);

	const completionItems = useMemo<CompletionItem[]>(() => {
		const firstLine = text.split("\n")[0];
		if (!firstLine.startsWith("/") && !firstLine.startsWith("!")) return [];

		const normalized = firstLine.toLowerCase();
		if (normalized.startsWith("/theme ")) {
			const query = firstLine.slice("/theme ".length).trim().toLowerCase();
			if (query.includes(" ")) return [];

			return codeThemes
				.filter(
					(theme) =>
						query.length === 0 ||
						theme.id.toLowerCase().includes(query) ||
						theme.label.toLowerCase().includes(query),
				)
				.map((theme) => ({
					id: `theme-${theme.id}`,
					insertText: `/theme ${theme.id}`,
					primary: theme.label,
					secondary: theme.id,
					desc: "Set app theme",
				}));
		}

		if (firstLine.includes(" ")) return [];

		return COMMANDS.filter((command) =>
			command.cmd.toLowerCase().startsWith(normalized),
		).map((command) => ({
			id: command.cmd,
			insertText: command.args ? `${command.cmd} ` : command.cmd,
			primary: command.cmd,
			secondary: command.args || undefined,
			monospace: true,
			desc: command.desc,
		}));
	}, [text]);

	const showPopover = completionItems.length > 0;

	const acceptCompletion = useCallback((item: CompletionItem) => {
		setText(item.insertText);
		setSelectedIndex(0);
		textareaRef.current?.focus();
	}, []);

	const handleSubmit = useCallback(() => {
		if (!text.trim() || !connected) return;

		const command = parseInput(text);
		dispatch({ type: "add-sent", text });

		switch (command.type) {
			case "clear":
				dispatch({ type: "clear-messages" });
				break;
			case "help":
				dispatch({ type: "toggle-help" });
				break;
			case "chat":
				onSend({ type: "chat", text: command.text });
				break;
			case "nick":
				onSend({ type: "nick", nick: command.nick });
				break;
			case "color":
				onSend({ type: "color", color: command.color });
				break;
			case "theme":
				if (!command.themeId) {
					dispatch({
						type: "server-message",
						message: {
							type: "error",
							text: "Usage: /theme <theme-id>",
						},
					});
					break;
				}

				if (!isCodeThemeId(command.themeId)) {
					dispatch({
						type: "server-message",
						message: {
							type: "error",
							text: `Unknown theme "${command.themeId}". Use /theme and press Tab to browse.`,
						},
					});
					break;
				}

				setCodeTheme(command.themeId);
				dispatch({
					type: "server-message",
					message: {
						type: "system",
						text: `Theme changed to ${getCodeThemeById(command.themeId).label}.`,
						timestamp: Date.now(),
					},
				});
				break;
			case "giphy":
				fetch(`/api/giphy?q=${encodeURIComponent(command.query)}`)
					.then((r) => r.json())
					.then((data) => {
						if (data.url) {
							onSend({
								type: "giphy",
								url: data.url,
								query: command.query,
							});
						} else {
							dispatch({
								type: "server-message",
								message: {
									type: "error",
									text: `No GIF found for "${command.query}"`,
								},
							});
						}
					})
					.catch(() => {
						dispatch({
							type: "server-message",
							message: {
								type: "error",
								text: "Failed to fetch GIF",
							},
						});
					});
				break;
			case "list":
				onSend({ type: "list" });
				break;
			case "pm":
				onSend({ type: "pm", to: command.to, text: command.text });
				break;
			case "code":
				onSend({
					type: "code",
					text: command.text,
					language: command.language,
				});
				break;
		}

		setText("");
		setSelectedIndex(0);
		resetHistory();
	}, [text, connected, onSend, dispatch, resetHistory, setCodeTheme]);

	const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
		const firstLine = text.split("\n")[0];
		if (showPopover) {
			if (e.key === "ArrowUp") {
				e.preventDefault();
				setSelectedIndex((i) => (i <= 0 ? completionItems.length - 1 : i - 1));
				return;
			}
			if (e.key === "ArrowDown") {
				e.preventDefault();
				setSelectedIndex((i) => (i >= completionItems.length - 1 ? 0 : i + 1));
				return;
			}
			if (e.key === "Tab" || (e.key === "Enter" && !e.shiftKey)) {
				e.preventDefault();
				const item = completionItems[selectedIndex] ?? completionItems[0];
				if (!item) return;

				if (
					e.key === "Enter" &&
					completionItems.length === 1 &&
					item.insertText === firstLine
				) {
					handleSubmit();
					return;
				}

				acceptCompletion(item);
				return;
			}
			if (e.key === "Escape") {
				e.preventDefault();
				setText("");
				setSelectedIndex(0);
				return;
			}
		}

		// Shift+Enter inserts newline (default textarea behavior)
		// Enter alone submits
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSubmit();
		}
		if (e.shiftKey && e.key === "ArrowUp") {
			e.preventDefault();
			const prev = navigateHistory("up");
			if (prev !== null) setText(prev);
		}
		if (e.shiftKey && e.key === "ArrowDown") {
			e.preventDefault();
			const next = navigateHistory("down");
			if (next !== null) setText(next);
		}
	};

	const handleChange = (value: string) => {
		setText(value);
		setSelectedIndex(0);
	};

	return (
		<div className="relative flex gap-2 p-3 border-t border-border bg-card">
			{showPopover && (
				<div className="absolute bottom-full left-3 right-3 z-10 mb-1 max-h-64 overflow-y-auto rounded-md border border-border bg-popover shadow-lg">
					{completionItems.map((item, i) => (
						<button
							key={item.id}
							type="button"
							className={`w-full flex items-center gap-3 px-3 py-2 text-sm text-left transition-colors ${
								i === selectedIndex
									? "bg-accent text-accent-foreground"
									: "hover:bg-accent/50"
							}`}
							onMouseEnter={() => setSelectedIndex(i)}
							onMouseDown={(e) => {
								e.preventDefault();
								acceptCompletion(item);
							}}
						>
							<span
								className={`shrink-0 text-primary ${
									item.monospace ? "font-mono" : "font-medium"
								}`}
							>
								{item.primary}
							</span>
							{item.secondary && (
								<span className="text-muted-foreground text-xs shrink-0">
									{item.secondary}
								</span>
							)}
							<span className="text-muted-foreground text-xs ml-auto truncate">
								{item.desc}
							</span>
						</button>
					))}
				</div>
			)}
			<textarea
				ref={textareaRef}
				value={text}
				onChange={(e) => handleChange(e.target.value)}
				onKeyDown={handleKeyDown}
				placeholder={
					connected
						? "Type a message or / for commands... (Shift+Enter for newline)"
						: "Connecting..."
				}
				disabled={!connected}
				className="flex-1 resize-none overflow-y-auto rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-xs outline-none placeholder:text-muted-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:border-ring disabled:cursor-not-allowed disabled:opacity-50"
				rows={1}
				// biome-ignore lint/a11y/noAutofocus: Chat UX expects immediate keyboard focus on load.
				autoFocus
			/>
			<Button
				onClick={handleSubmit}
				disabled={!connected || !text.trim()}
				size="icon"
				className="self-end"
			>
				<Send className="h-4 w-4" />
			</Button>
		</div>
	);
}
