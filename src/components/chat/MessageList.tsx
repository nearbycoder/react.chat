import { useEffect, useRef } from "react";
import { useChatState } from "../../hooks/useChatStore";
import { ScrollArea } from "../ui/scroll-area";
import { MessageItem } from "./MessageItem";

export function MessageList() {
	const { messages, nick } = useChatState();
	const bottomRef = useRef<HTMLDivElement>(null);
	const lastMessageId = messages[messages.length - 1]?.id;

	useEffect(() => {
		if (!lastMessageId) return;
		bottomRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [lastMessageId]);

	return (
		<ScrollArea className="min-h-0 flex-1">
			<div className="min-w-0 py-2 pr-4">
				{messages.length === 0 && (
					<div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
						No messages yet. Say hello!
					</div>
				)}
				{messages.map((msg) => (
					<MessageItem key={msg.id} message={msg} currentNick={nick} />
				))}
				<div ref={bottomRef} />
			</div>
		</ScrollArea>
	);
}
