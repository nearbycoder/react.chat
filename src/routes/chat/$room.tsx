import { createFileRoute } from "@tanstack/react-router";
import { useState, useCallback, useEffect } from "react";
import { ChatProvider, useChatDispatch } from "../../hooks/useChatStore";
import { useWebSocket } from "../../hooks/useWebSocket";
import { ChatLayout } from "../../components/chat/ChatLayout";
import { NicknameDialog } from "../../components/chat/NicknameDialog";
import { useTheme } from "../../hooks/useTheme";

export const Route = createFileRoute("/chat/$room")({ component: ChatRoom });

function ChatRoom() {
	const { room } = Route.useParams();
	const savedNick =
		typeof window !== "undefined"
			? localStorage.getItem("react-chat-nick") || ""
			: "";
	const [nick, setNick] = useState(savedNick);
	const [ready, setReady] = useState(!!savedNick);

	const handleNickSubmit = useCallback((newNick: string) => {
		setNick(newNick);
		setReady(true);
	}, []);

	if (!ready) {
		return (
			<div className="min-h-screen bg-background">
				<NicknameDialog open={true} onSubmit={handleNickSubmit} />
			</div>
		);
	}

	return (
		<ChatProvider>
			<ChatRoomInner room={room} nick={nick} />
		</ChatProvider>
	);
}

function ChatRoomInner({ room, nick }: { room: string; nick: string }) {
	useTheme();
	const dispatch = useChatDispatch();
	const { sendMessage } = useWebSocket(room, nick);

	useEffect(() => {
		dispatch({ type: "set-nick", nick });
		dispatch({ type: "set-room", room });
	}, [nick, room, dispatch]);

	return <ChatLayout onSend={sendMessage} />;
}
