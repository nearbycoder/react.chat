import { useEffect, useMemo } from "react";
import { type ChatMessage, useChatState } from "../../hooks/useChatStore";
import { buildMessageThreads } from "../../lib/chat-threads";
import { ScrollArea } from "../ui/scroll-area";
import { MessageItem } from "./MessageItem";

interface MessageListProps {
	onReply: (message: ChatMessage) => void;
}

export function MessageList({ onReply }: MessageListProps) {
	const { messages, nick } = useChatState();
	const threads = useMemo(() => buildMessageThreads(messages), [messages]);
	const lastMessageId = messages[messages.length - 1]?.id;

	useEffect(() => {
		if (!lastMessageId) return;
		document
			.getElementById(`message-${lastMessageId}`)
			?.scrollIntoView({ behavior: "smooth", block: "nearest" });
	}, [lastMessageId]);

	return (
		<ScrollArea className="min-h-0 flex-1">
			<div className="min-w-0 py-2 pr-2 sm:pr-4">
				{messages.length === 0 && (
					<div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
						No messages yet. Say hello!
					</div>
				)}
				{threads.map((thread) => (
					<div key={thread.message.id}>
						<MessageItem
							message={thread.message}
							currentNick={nick}
							onReply={() => onReply(thread.message)}
						/>
						{thread.replies.map((reply) => (
							<MessageItem
								key={reply.id}
								message={reply}
								currentNick={nick}
								isReply
								onReply={() => onReply(thread.message)}
							/>
						))}
					</div>
				))}
			</div>
		</ScrollArea>
	);
}
