import { useEffect, useRef } from "react";
import { ScrollArea } from "../ui/scroll-area";
import { useChatState } from "../../hooks/useChatStore";
import { MessageItem } from "./MessageItem";

export function MessageList() {
	const { messages, nick } = useChatState();
	const bottomRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		bottomRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages.length]);

	return (
		<ScrollArea className="flex-1">
			<div className="py-2">
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
