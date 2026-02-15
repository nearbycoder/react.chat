import { useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

interface NicknameDialogProps {
	open: boolean;
	onSubmit: (nick: string) => void;
}

export function NicknameDialog({ open, onSubmit }: NicknameDialogProps) {
	const [nick, setNick] = useState("");

	const handleSubmit = () => {
		const trimmed = nick.trim();
		if (trimmed) {
			localStorage.setItem("react-chat-nick", trimmed);
			onSubmit(trimmed);
		}
	};

	return (
		<Dialog open={open}>
			<DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
				<DialogHeader>
					<DialogTitle>Choose a nickname</DialogTitle>
					<DialogDescription>
						Pick a name to use in the chat room. You can change it later with /nick.
					</DialogDescription>
				</DialogHeader>
				<div className="flex gap-2">
					<Input
						value={nick}
						onChange={(e) => setNick(e.target.value)}
						onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
						placeholder="Enter nickname..."
						autoFocus
					/>
					<Button onClick={handleSubmit} disabled={!nick.trim()}>
						Join
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
