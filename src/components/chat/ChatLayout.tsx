import { useState } from "react";
import { MessageList } from "./MessageList";
import { ChatInput } from "./ChatInput";
import { UserSidebar } from "./UserSidebar";
import { HelpDialog } from "./HelpDialog";
import { ThemePicker } from "./ThemePicker";
import { useChatState } from "../../hooks/useChatStore";
import { useFavicon } from "../../hooks/useFavicon";
import { Badge } from "../ui/badge";
import type { ClientMessage } from "../../../server/lib/message-types";

interface ChatLayoutProps {
	onSend: (msg: ClientMessage) => void;
}

export function ChatLayout({ onSend }: ChatLayoutProps) {
	const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
	const { room, nick, connected } = useChatState();
	useFavicon();

	return (
		<div className="flex flex-col h-screen bg-background">
			{/* Top bar */}
			<div className="flex items-center justify-between px-4 py-2 border-b border-border bg-card">
				<div className="flex items-center gap-3">
					<h1 className="text-lg font-bold tracking-tight">React Chat</h1>
					<Badge variant="outline">#{room}</Badge>
				</div>
				<div className="flex items-center gap-2 text-sm text-muted-foreground">
					<ThemePicker />
					<span
						className={`inline-block w-2 h-2 rounded-full ${connected ? "bg-green-500" : "bg-red-500"}`}
					/>
					<span>{nick}</span>
				</div>
			</div>

			{/* Main content */}
			<div className="flex flex-1 overflow-hidden">
				<div className="flex flex-col flex-1 min-w-0">
					<MessageList />
					<ChatInput onSend={onSend} />
				</div>
				<UserSidebar
					collapsed={sidebarCollapsed}
					onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
				/>
			</div>

			<HelpDialog />
		</div>
	);
}
