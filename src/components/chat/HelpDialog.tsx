import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from "../ui/dialog";
import { Separator } from "../ui/separator";
import { useChatState, useChatDispatch } from "../../hooks/useChatStore";

const commands = [
	{ cmd: "/nick <name>", desc: "Change your nickname" },
	{ cmd: "/color <color>", desc: "Change your message color (any CSS color)" },
	{ cmd: "/pm @user message", desc: "Send a private message" },
	{ cmd: "/giphy <query>", desc: "Send a GIF from Giphy" },
	{ cmd: "!code <text>", desc: "Send a syntax-highlighted code block" },
	{ cmd: "/list", desc: "Refresh the user list" },
	{ cmd: "/clear", desc: "Clear your local messages" },
	{ cmd: "/help", desc: "Toggle this help dialog" },
];

export function HelpDialog() {
	const { showHelp } = useChatState();
	const dispatch = useChatDispatch();

	return (
		<Dialog
			open={showHelp}
			onOpenChange={() => dispatch({ type: "toggle-help" })}
		>
			<DialogContent className="sm:max-w-lg">
				<DialogHeader>
					<DialogTitle>Chat Commands</DialogTitle>
					<DialogDescription>
						Available commands you can use in the chat input.
					</DialogDescription>
				</DialogHeader>
				<Separator />
				<div className="space-y-3">
					{commands.map(({ cmd, desc }) => (
						<div key={cmd} className="flex items-start gap-3">
							<code className="text-sm bg-muted px-2 py-1 rounded font-mono whitespace-nowrap">
								{cmd}
							</code>
							<span className="text-sm text-muted-foreground">{desc}</span>
						</div>
					))}
				</div>
				<Separator />
				<p className="text-xs text-muted-foreground">
					Use Shift+Up/Down to navigate message history.
				</p>
			</DialogContent>
		</Dialog>
	);
}
