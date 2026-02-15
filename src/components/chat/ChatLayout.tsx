import { Users } from "lucide-react";
import { useState } from "react";
import type { ClientMessage } from "../../../server/lib/message-types";
import { useChatState } from "../../hooks/useChatStore";
import { useFavicon } from "../../hooks/useFavicon";
import { Badge } from "../ui/badge";
import { ChatInput } from "./ChatInput";
import { HelpDialog } from "./HelpDialog";
import { MessageList } from "./MessageList";
import { ThemePicker } from "./ThemePicker";
import { UserSidebar } from "./UserSidebar";

interface ChatLayoutProps {
	onSend: (msg: ClientMessage) => void;
}

export function ChatLayout({ onSend }: ChatLayoutProps) {
	const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
	const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
	const { room, nick, connected } = useChatState();
	useFavicon();

	return (
		<div className="flex h-dvh min-h-0 flex-col bg-background">
			{/* Top bar */}
			<div className="flex items-center justify-between border-b border-border bg-card px-2 py-2 sm:px-4">
				<div className="flex min-w-0 items-center gap-2 sm:gap-3">
					<h1 className="truncate text-base font-bold tracking-tight sm:text-lg">
						React Chat
					</h1>
					<Badge variant="outline" className="hidden sm:inline-flex">
						#{room}
					</Badge>
				</div>
				<div className="flex min-w-0 items-center gap-1 text-xs text-muted-foreground sm:gap-2 sm:text-sm">
					<ThemePicker />
					<span
						className={`inline-block h-2 w-2 rounded-full ${connected ? "bg-green-500" : "bg-red-500"}`}
					/>
					<span className="max-w-24 truncate sm:max-w-40">{nick}</span>
					<button
						type="button"
						onClick={() => setMobileSidebarOpen(true)}
						className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border bg-background text-foreground transition-colors hover:bg-accent md:hidden"
						aria-label="Open users list"
					>
						<Users className="h-4 w-4" />
					</button>
				</div>
			</div>

			{/* Main content */}
			<div className="flex min-h-0 flex-1 overflow-hidden">
				<div className="flex min-h-0 min-w-0 flex-1 flex-col">
					<MessageList />
					<ChatInput onSend={onSend} />
				</div>
				<UserSidebar
					collapsed={sidebarCollapsed}
					onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
					mobileOpen={mobileSidebarOpen}
					onMobileOpenChange={setMobileSidebarOpen}
				/>
			</div>

			<HelpDialog />
		</div>
	);
}
