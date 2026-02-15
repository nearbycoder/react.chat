import { useEffect } from "react";
import { useChatState, useChatDispatch } from "./useChatStore";

export function useFavicon() {
	const { unreadCount, room } = useChatState();
	const dispatch = useChatDispatch();

	useEffect(() => {
		const base = room ? `#${room} - React Chat` : "React Chat";
		document.title = unreadCount > 0 ? `(${unreadCount}) ${base}` : base;
	}, [unreadCount, room]);

	useEffect(() => {
		function handleVisibility() {
			if (!document.hidden) {
				dispatch({ type: "reset-unread" });
			}
		}
		document.addEventListener("visibilitychange", handleVisibility);
		return () =>
			document.removeEventListener("visibilitychange", handleVisibility);
	}, [dispatch]);
}
