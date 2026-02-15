import { useState, useCallback } from "react";
import { useChatState } from "./useChatStore";

export function useMessageHistory() {
	const { sentHistory } = useChatState();
	const [historyIndex, setHistoryIndex] = useState(-1);

	const navigateHistory = useCallback(
		(direction: "up" | "down"): string | null => {
			if (sentHistory.length === 0) return null;

			if (direction === "up") {
				const newIndex =
					historyIndex === -1
						? sentHistory.length - 1
						: Math.max(0, historyIndex - 1);
				setHistoryIndex(newIndex);
				return sentHistory[newIndex];
			}

			if (historyIndex === -1) return null;
			const newIndex = historyIndex + 1;
			if (newIndex >= sentHistory.length) {
				setHistoryIndex(-1);
				return "";
			}
			setHistoryIndex(newIndex);
			return sentHistory[newIndex];
		},
		[sentHistory, historyIndex],
	);

	const resetHistory = useCallback(() => {
		setHistoryIndex(-1);
	}, []);

	return { navigateHistory, resetHistory };
}
