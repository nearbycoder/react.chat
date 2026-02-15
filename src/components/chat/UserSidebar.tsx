import { Circle, Users, X } from "lucide-react";
import { useEffect } from "react";
import { useChatState } from "../../hooks/useChatStore";
import { cn } from "../../lib/utils";
import { Badge } from "../ui/badge";
import { ScrollArea } from "../ui/scroll-area";
import { Separator } from "../ui/separator";

interface UserSidebarProps {
	collapsed: boolean;
	onToggle: () => void;
	mobileOpen: boolean;
	onMobileOpenChange: (open: boolean) => void;
}

export function UserSidebar({
	collapsed,
	onToggle,
	mobileOpen,
	onMobileOpenChange,
}: UserSidebarProps) {
	const { users, room } = useChatState();

	useEffect(() => {
		if (!mobileOpen) return;

		const handleEscape = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				onMobileOpenChange(false);
			}
		};

		window.addEventListener("keydown", handleEscape);
		return () => window.removeEventListener("keydown", handleEscape);
	}, [mobileOpen, onMobileOpenChange]);

	useEffect(() => {
		if (!mobileOpen) return;

		const originalOverflow = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		return () => {
			document.body.style.overflow = originalOverflow;
		};
	}, [mobileOpen]);

	const usersList = (
		<ScrollArea className="flex-1">
			<div className="space-y-1 p-2">
				{users.map((user) => (
					<div
						key={user.nick}
						className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-accent/50"
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
	);

	const desktopSidebar = collapsed ? (
		<button
			type="button"
			onClick={onToggle}
			className="hidden flex-col items-center gap-2 border-l border-border bg-card p-2 transition-colors hover:bg-accent md:flex"
		>
			<Users className="h-5 w-5 text-muted-foreground" />
			<Badge variant="secondary" className="text-xs px-1">
				{users.length}
			</Badge>
		</button>
	) : (
		<div className="hidden w-56 flex-col border-l border-border bg-card md:flex">
			<div className="flex items-center justify-between p-3">
				<div className="flex min-w-0 items-center gap-2">
					<Users className="h-4 w-4 text-muted-foreground" />
					<span className="truncate text-sm font-medium">#{room}</span>
					<Badge variant="secondary" className="text-xs">
						{users.length}
					</Badge>
				</div>
				<button
					type="button"
					onClick={onToggle}
					className="text-xs text-muted-foreground hover:text-foreground"
				>
					Hide
				</button>
			</div>
			<Separator />
			{usersList}
		</div>
	);

	return (
		<>
			{desktopSidebar}

			<button
				type="button"
				className={cn(
					"fixed inset-0 z-40 bg-black/40 transition-opacity md:hidden",
					mobileOpen
						? "pointer-events-auto opacity-100"
						: "pointer-events-none opacity-0",
				)}
				aria-label="Close users list overlay"
				onClick={() => onMobileOpenChange(false)}
			/>
			<div
				className={cn(
					"fixed right-0 top-0 z-50 flex h-dvh w-[82vw] max-w-72 flex-col border-l border-border bg-card transition-transform duration-200 md:hidden",
					mobileOpen ? "translate-x-0" : "translate-x-full",
				)}
			>
				<div className="flex items-center justify-between p-3">
					<div className="flex min-w-0 items-center gap-2">
						<Users className="h-4 w-4 text-muted-foreground" />
						<span className="truncate text-sm font-medium">#{room}</span>
						<Badge variant="secondary" className="text-xs">
							{users.length}
						</Badge>
					</div>
					<button
						type="button"
						onClick={() => onMobileOpenChange(false)}
						className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-border bg-background transition-colors hover:bg-accent"
						aria-label="Close users list"
					>
						<X className="h-4 w-4" />
					</button>
				</div>
				<Separator />
				{usersList}
			</div>
		</>
	);
}
