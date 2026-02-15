import { useEffect, useRef, useCallback } from "react";
import type { ClientMessage, ServerMessage } from "../../server/lib/message-types";
import { useChatDispatch } from "./useChatStore";

export function useWebSocket(room: string, nick: string) {
	const wsRef = useRef<WebSocket | null>(null);
	const reconnectTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
	const disposed = useRef(false);
	const dispatch = useChatDispatch();

	// Keep room/nick in refs so the connect function never needs to change
	const roomRef = useRef(room);
	const nickRef = useRef(nick);
	roomRef.current = room;
	nickRef.current = nick;

	useEffect(() => {
		disposed.current = false;

		function connect() {
			if (disposed.current) return;
			// Don't open a second socket if one is already open or connecting
			if (
				wsRef.current &&
				(wsRef.current.readyState === WebSocket.OPEN ||
					wsRef.current.readyState === WebSocket.CONNECTING)
			) {
				return;
			}

			const protocol =
				window.location.protocol === "https:" ? "wss:" : "ws:";
			const ws = new WebSocket(
				`${protocol}//${window.location.host}/ws`,
			);
			wsRef.current = ws;

			ws.onopen = () => {
				if (disposed.current) {
					ws.close();
					return;
				}
				dispatch({ type: "set-connected", connected: true });
				const savedColor = localStorage.getItem("react-chat-color") || undefined;
				const joinMsg: ClientMessage = {
					type: "join",
					room: roomRef.current,
					nick: nickRef.current,
					color: savedColor,
				};
				ws.send(JSON.stringify(joinMsg));
			};

			ws.onmessage = (event) => {
				try {
					const msg: ServerMessage = JSON.parse(event.data);
					dispatch({ type: "server-message", message: msg });
				} catch {
					// ignore malformed messages
				}
			};

			ws.onclose = () => {
				dispatch({ type: "set-connected", connected: false });
				if (wsRef.current === ws) {
					wsRef.current = null;
				}
				// Only reconnect if not intentionally disposed
				if (!disposed.current) {
					reconnectTimer.current = setTimeout(connect, 2000);
				}
			};
		}

		connect();

		return () => {
			disposed.current = true;
			clearTimeout(reconnectTimer.current);
			wsRef.current?.close();
			wsRef.current = null;
		};
	}, []); // stable — no deps, uses refs for room/nick

	const sendMessage = useCallback((msg: ClientMessage) => {
		if (wsRef.current?.readyState === WebSocket.OPEN) {
			wsRef.current.send(JSON.stringify(msg));
		}
	}, []);

	return { sendMessage };
}
