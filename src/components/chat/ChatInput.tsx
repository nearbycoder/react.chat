import { useState, useCallback, useMemo, useRef, useEffect, type KeyboardEvent } from "react";
import { Button } from "../ui/button";
import { Send } from "lucide-react";
import { parseInput } from "../../lib/commands";
import { useChatState, useChatDispatch } from "../../hooks/useChatStore";
import { useMessageHistory } from "../../hooks/useMessageHistory";
import type { ClientMessage } from "../../../server/lib/message-types";

const COMMANDS = [
	{ cmd: "/nick", args: "<name>", desc: "Change nickname" },
	{ cmd: "/color", args: "<color>", desc: "Change message color" },
	{ cmd: "/pm", args: "@user message", desc: "Private message" },
	{ cmd: "/giphy", args: "<query>", desc: "Send a GIF" },
	{ cmd: "/list", args: "", desc: "Refresh user list" },
	{ cmd: "/clear", args: "", desc: "Clear messages" },
	{ cmd: "/help", args: "", desc: "Show all commands" },
	{ cmd: "!code", args: "<text>", desc: "Code block" },
];

interface ChatInputProps {
	onSend: (msg: ClientMessage) => void;
}

export function ChatInput({ onSend }: ChatInputProps) {
	const [text, setText] = useState("");
	const [selectedIndex, setSelectedIndex] = useState(0);
	const { connected } = useChatState();
	const dispatch = useChatDispatch();
	const { navigateHistory, resetHistory } = useMessageHistory();
	const textareaRef = useRef<HTMLTextAreaElement>(null);

	// Auto-resize textarea
	useEffect(() => {
		const el = textareaRef.current;
		if (!el) return;
		el.style.height = "0";
		el.style.height = `${Math.min(el.scrollHeight, 150)}px`;
	}, [text]);

	const filtered = useMemo(() => {
		const firstLine = text.split("\n")[0];
		if (!firstLine.startsWith("/") && !firstLine.startsWith("!")) return [];
		if (firstLine.includes(" ")) return [];
		return COMMANDS.filter((c) =>
			c.cmd.toLowerCase().startsWith(firstLine.toLowerCase()),
		);
	}, [text]);

	const showPopover = filtered.length > 0;

	const acceptCompletion = useCallback(
		(cmd: string, args: string) => {
			setText(args ? `${cmd} ` : cmd);
			setSelectedIndex(0);
			textareaRef.current?.focus();
		},
		[],
	);

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
				onSend({ type: "code", text: command.text, language: command.language });
				break;
		}

		setText("");
		setSelectedIndex(0);
		resetHistory();
	}, [text, connected, onSend, dispatch, resetHistory]);

	const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
		if (showPopover) {
			if (e.key === "ArrowUp") {
				e.preventDefault();
				setSelectedIndex((i) =>
					i <= 0 ? filtered.length - 1 : i - 1,
				);
				return;
			}
			if (e.key === "ArrowDown") {
				e.preventDefault();
				setSelectedIndex((i) =>
					i >= filtered.length - 1 ? 0 : i + 1,
				);
				return;
			}
			if (e.key === "Tab" || (e.key === "Enter" && filtered.length > 0 && !text.includes(" "))) {
				e.preventDefault();
				const item = filtered[selectedIndex];
				if (item) acceptCompletion(item.cmd, item.args);
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
				<div className="absolute bottom-full left-3 right-3 mb-1 bg-popover border border-border rounded-md shadow-lg overflow-hidden z-10">
					{filtered.map((item, i) => (
						<button
							key={item.cmd}
							type="button"
							className={`w-full flex items-center gap-3 px-3 py-2 text-sm text-left transition-colors ${
								i === selectedIndex
									? "bg-accent text-accent-foreground"
									: "hover:bg-accent/50"
							}`}
							onMouseEnter={() => setSelectedIndex(i)}
							onMouseDown={(e) => {
								e.preventDefault();
								acceptCompletion(item.cmd, item.args);
							}}
						>
							<code className="font-mono text-primary shrink-0">
								{item.cmd}
							</code>
							{item.args && (
								<span className="text-muted-foreground text-xs shrink-0">
									{item.args}
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
