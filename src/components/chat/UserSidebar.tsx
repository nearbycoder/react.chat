import { Users, Circle } from "lucide-react";
import { ScrollArea } from "../ui/scroll-area";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
import { useChatState } from "../../hooks/useChatStore";

interface UserSidebarProps {
	collapsed: boolean;
	onToggle: () => void;
}

export function UserSidebar({ collapsed, onToggle }: UserSidebarProps) {
	const { users, room } = useChatState();

	if (collapsed) {
		return (
			<button
				type="button"
				onClick={onToggle}
				className="flex flex-col items-center p-2 border-l border-border bg-card gap-2 hover:bg-accent transition-colors"
			>
				<Users className="h-5 w-5 text-muted-foreground" />
				<Badge variant="secondary" className="text-xs px-1">
					{users.length}
				</Badge>
			</button>
		);
	}

	return (
		<div className="w-56 border-l border-border bg-card flex flex-col">
			<div className="flex items-center justify-between p-3">
				<div className="flex items-center gap-2">
					<Users className="h-4 w-4 text-muted-foreground" />
					<span className="text-sm font-medium">
						#{room}
					</span>
					<Badge variant="secondary" className="text-xs">
						{users.length}
					</Badge>
				</div>
				<button
					type="button"
					onClick={onToggle}
					className="text-muted-foreground hover:text-foreground text-xs"
				>
					Hide
				</button>
			</div>
			<Separator />
			<ScrollArea className="flex-1">
				<div className="p-2 space-y-1">
					{users.map((user) => (
						<div
							key={user.nick}
							className="flex items-center gap-2 px-2 py-1.5 rounded-md text-sm hover:bg-accent/50 transition-colors"
						>
							<Circle
								className="h-2.5 w-2.5 fill-current"
								style={{ color: user.color }}
							/>
							<span className="truncate">{user.nick}</span>
						</div>
					))}
				</div>
			</ScrollArea>
		</div>
	);
}
