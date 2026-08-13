export interface ThreadableMessage {
	id: string;
	replyTo?: string;
}

export interface MessageThread<T extends ThreadableMessage> {
	message: T;
	replies: T[];
}

export function buildMessageThreads<T extends ThreadableMessage>(
	messages: T[],
): MessageThread<T>[] {
	const messagesById = new Map(
		messages.map((message) => [message.id, message]),
	);
	const repliesByRoot = new Map<string, T[]>();
	const rootIds = new Set<string>();

	function getRootId(message: T): string {
		let current = message;
		const seen = new Set([message.id]);

		while (current.replyTo) {
			const parent = messagesById.get(current.replyTo);
			if (!parent || seen.has(parent.id)) return message.id;
			seen.add(parent.id);
			current = parent;
		}

		return current.id;
	}

	for (const message of messages) {
		const rootId = getRootId(message);
		if (rootId === message.id) {
			rootIds.add(message.id);
			continue;
		}

		const replies = repliesByRoot.get(rootId) ?? [];
		replies.push(message);
		repliesByRoot.set(rootId, replies);
	}

	return messages
		.filter((message) => rootIds.has(message.id))
		.map((message) => ({
			message,
			replies: repliesByRoot.get(message.id) ?? [],
		}));
}
