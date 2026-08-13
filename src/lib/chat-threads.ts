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
	const resolvedRoots = new Map<string, string>();

	function getRootId(message: T): string {
		const path: T[] = [];
		const seen = new Set<string>();
		let current = message;
		let rootId: string;

		while (true) {
			const resolved = resolvedRoots.get(current.id);
			if (resolved) {
				rootId = resolved;
				break;
			}
			if (seen.has(current.id)) {
				rootId = message.id;
				break;
			}

			seen.add(current.id);
			path.push(current);
			const parent = current.replyTo
				? messagesById.get(current.replyTo)
				: undefined;
			if (!parent) {
				rootId = current.replyTo ? message.id : current.id;
				break;
			}
			current = parent;
		}

		for (const visited of path) resolvedRoots.set(visited.id, rootId);
		return rootId;
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
