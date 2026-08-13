import { Reply } from "lucide-react";
import type { ChatMessage } from "../../hooks/useChatStore";
import { CodeBlock } from "./CodeBlock";

interface MessageItemProps {
	message: ChatMessage;
	currentNick: string;
	isReply?: boolean;
	onReply?: () => void;
}

function formatTime(ts: number): string {
	return new Date(ts).toLocaleTimeString([], {
		hour: "2-digit",
		minute: "2-digit",
	});
}

export function MessageItem({
	message,
	currentNick,
	isReply = false,
	onReply,
}: MessageItemProps) {
	const time = formatTime(message.timestamp);
	const elementId = `message-${message.id}`;

	switch (message.type) {
		case "system":
			return (
				<div
					id={elementId}
					className="animate-in px-3 py-1 text-sm text-muted-foreground italic duration-200 fade-in slide-in-from-bottom-1 sm:px-4"
				>
					<span className="opacity-60 mr-2">{time}</span>
					{message.text}
				</div>
			);

		case "error":
			return (
				<div
					id={elementId}
					className="animate-in px-3 py-1 text-sm text-destructive-foreground duration-200 fade-in slide-in-from-bottom-1 sm:px-4"
				>
					<span className="opacity-60 mr-2">{time}</span>
					{message.text}
				</div>
			);

		case "chat": {
			const isMe = message.nick?.toLowerCase() === currentNick.toLowerCase();
			return (
				<div
					id={elementId}
					className={`group animate-in py-1 transition-colors duration-200 fade-in slide-in-from-bottom-1 hover:bg-accent/30 ${isReply ? "ml-6 border-l-2 border-border px-3 sm:ml-10 sm:px-4" : "px-3 sm:px-4"} ${isMe ? "bg-accent/10" : ""}`}
				>
					<span className="opacity-60 text-xs mr-2">{time}</span>
					<span className="font-semibold mr-2" style={{ color: message.color }}>
						{message.nick}
					</span>
					<span className="text-foreground break-words whitespace-pre-wrap">
						{message.text}
					</span>
					{onReply && (
						<button
							type="button"
							onClick={onReply}
							className="ml-2 inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs text-muted-foreground opacity-60 transition-colors hover:bg-accent hover:text-accent-foreground sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
							aria-label={`Reply to ${message.nick}`}
						>
							<Reply className="h-3 w-3" />
							Reply
						</button>
					)}
				</div>
			);
		}

		case "pm": {
			const isSender =
				message.from?.toLowerCase() === currentNick.toLowerCase();
			return (
				<div
					id={elementId}
					className="animate-in border-l-2 border-purple-500 bg-purple-500/10 px-3 py-1 duration-200 fade-in slide-in-from-bottom-1 sm:px-4"
				>
					<span className="opacity-60 text-xs mr-2">{time}</span>
					<span className="text-purple-400 font-semibold text-sm mr-1">
						[PM]
					</span>
					<span className="font-semibold mr-1" style={{ color: message.color }}>
						{isSender ? `to @${message.to}` : message.from}
					</span>
					<span className="text-foreground break-words">{message.text}</span>
				</div>
			);
		}

		case "giphy":
			return (
				<div
					id={elementId}
					className="animate-in px-3 py-2 duration-200 fade-in slide-in-from-bottom-1 sm:px-4"
				>
					<span className="opacity-60 text-xs mr-2">{time}</span>
					<span className="font-semibold mr-2" style={{ color: message.color }}>
						{message.nick}
					</span>
					<span className="text-muted-foreground text-sm">
						/giphy {message.query}
					</span>
					<img
						src={message.url}
						alt={message.query}
						className="mt-1 rounded-md max-w-xs max-h-48"
						loading="lazy"
					/>
				</div>
			);

		case "code":
			return (
				<div
					id={elementId}
					className="animate-in px-3 py-1 duration-200 fade-in slide-in-from-bottom-1 sm:px-4"
				>
					<span className="opacity-60 text-xs mr-2">{time}</span>
					<span className="font-semibold mr-2" style={{ color: message.color }}>
						{message.nick}
					</span>
					<CodeBlock text={message.text || ""} language={message.language} />
				</div>
			);

		default:
			return null;
	}
}
