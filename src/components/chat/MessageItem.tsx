import type { ChatMessage } from "../../hooks/useChatStore";
import { CodeBlock } from "./CodeBlock";

interface MessageItemProps {
	message: ChatMessage;
	currentNick: string;
}

function formatTime(ts: number): string {
	return new Date(ts).toLocaleTimeString([], {
		hour: "2-digit",
		minute: "2-digit",
	});
}

export function MessageItem({ message, currentNick }: MessageItemProps) {
	const time = formatTime(message.timestamp);

	switch (message.type) {
		case "system":
			return (
				<div className="px-4 py-1 text-sm text-muted-foreground italic animate-in fade-in slide-in-from-bottom-1 duration-200">
					<span className="opacity-60 mr-2">{time}</span>
					{message.text}
				</div>
			);

		case "error":
			return (
				<div className="px-4 py-1 text-sm text-destructive-foreground animate-in fade-in slide-in-from-bottom-1 duration-200">
					<span className="opacity-60 mr-2">{time}</span>
					{message.text}
				</div>
			);

		case "chat": {
			const isMe =
				message.nick?.toLowerCase() === currentNick.toLowerCase();
			return (
				<div
					className={`px-4 py-1 hover:bg-accent/30 transition-colors animate-in fade-in slide-in-from-bottom-1 duration-200 ${isMe ? "bg-accent/10" : ""}`}
				>
					<span className="opacity-60 text-xs mr-2">{time}</span>
					<span
						className="font-semibold mr-2"
						style={{ color: message.color }}
					>
						{message.nick}
					</span>
					<span className="text-foreground break-words whitespace-pre-wrap">
						{message.text}
					</span>
				</div>
			);
		}

		case "pm": {
			const isSender =
				message.from?.toLowerCase() === currentNick.toLowerCase();
			return (
				<div className="px-4 py-1 bg-purple-500/10 border-l-2 border-purple-500 animate-in fade-in slide-in-from-bottom-1 duration-200">
					<span className="opacity-60 text-xs mr-2">{time}</span>
					<span className="text-purple-400 font-semibold text-sm mr-1">
						[PM]
					</span>
					<span
						className="font-semibold mr-1"
						style={{ color: message.color }}
					>
						{isSender ? `to @${message.to}` : message.from}
					</span>
					<span className="text-foreground break-words">
						{message.text}
					</span>
				</div>
			);
		}

		case "giphy":
			return (
				<div className="px-4 py-2 animate-in fade-in slide-in-from-bottom-1 duration-200">
					<span className="opacity-60 text-xs mr-2">{time}</span>
					<span
						className="font-semibold mr-2"
						style={{ color: message.color }}
					>
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
				<div className="px-4 py-1 animate-in fade-in slide-in-from-bottom-1 duration-200">
					<span className="opacity-60 text-xs mr-2">{time}</span>
					<span
						className="font-semibold mr-2"
						style={{ color: message.color }}
					>
						{message.nick}
					</span>
					<CodeBlock text={message.text || ""} language={message.language} />
				</div>
			);

		default:
			return null;
	}
}
