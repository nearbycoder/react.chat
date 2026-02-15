import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "../components/ui/card";
import { MessageSquare } from "lucide-react";
import { useTheme } from "../hooks/useTheme";

export const Route = createFileRoute("/")({ component: Lobby });

function Lobby() {
	useTheme();
	const navigate = useNavigate();
	const [room, setRoom] = useState("general");
	const [nick, setNick] = useState(
		() =>
			typeof window !== "undefined"
				? localStorage.getItem("react-chat-nick") || ""
				: "",
	);

	const handleJoin = () => {
		const trimmedRoom = room.trim().toLowerCase().replace(/[^a-z0-9-]/g, "");
		if (!trimmedRoom) return;

		if (nick.trim()) {
			localStorage.setItem("react-chat-nick", nick.trim());
		}

		navigate({ to: "/chat/$room", params: { room: trimmedRoom } });
	};

	return (
		<div className="min-h-screen bg-background flex items-center justify-center p-4">
			<Card className="w-full max-w-md">
				<CardHeader className="text-center">
					<div className="flex justify-center mb-2">
						<MessageSquare className="h-12 w-12 text-primary" />
					</div>
					<CardTitle className="text-2xl">React Chat</CardTitle>
					<CardDescription>
						Join an ephemeral chat room. No accounts, no history — just
						real-time conversation.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="space-y-2">
						<label htmlFor="room" className="text-sm font-medium">
							Room
						</label>
						<Input
							id="room"
							value={room}
							onChange={(e) => setRoom(e.target.value)}
							onKeyDown={(e) => e.key === "Enter" && handleJoin()}
							placeholder="general"
						/>
					</div>
					<div className="space-y-2">
						<label htmlFor="nick" className="text-sm font-medium">
							Nickname{" "}
							<span className="text-muted-foreground">(optional)</span>
						</label>
						<Input
							id="nick"
							value={nick}
							onChange={(e) => setNick(e.target.value)}
							onKeyDown={(e) => e.key === "Enter" && handleJoin()}
							placeholder="Leave blank for random name"
						/>
					</div>
					<Button onClick={handleJoin} className="w-full" size="lg">
						Join Room
					</Button>
				</CardContent>
			</Card>
		</div>
	);
}
