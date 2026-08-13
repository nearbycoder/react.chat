import { describe, expect, it } from "vitest";
import { buildMessageThreads } from "./chat-threads";

interface TestMessage {
	id: string;
	replyTo?: string;
}

describe("buildMessageThreads", () => {
	it("groups direct and nested replies under the root message", () => {
		const messages: TestMessage[] = [
			{ id: "root" },
			{ id: "other" },
			{ id: "reply", replyTo: "root" },
			{ id: "nested", replyTo: "reply" },
		];

		expect(buildMessageThreads(messages)).toEqual([
			{
				message: messages[0],
				replies: [messages[2], messages[3]],
			},
			{ message: messages[1], replies: [] },
		]);
	});

	it("continues a thread from a visible reply whose root is unavailable", () => {
		const orphan = { id: "orphan", replyTo: "missing" };
		const continuedReply = { id: "continued", replyTo: "orphan" };

		expect(buildMessageThreads([orphan, continuedReply])).toEqual([
			{ message: orphan, replies: [continuedReply] },
		]);
	});

	it("groups long reply chains without repeatedly walking every ancestor", () => {
		const messages: TestMessage[] = [{ id: "message-0" }];
		for (let index = 1; index < 10_000; index++) {
			messages.push({
				id: `message-${index}`,
				replyTo: `message-${index - 1}`,
			});
		}

		const threads = buildMessageThreads(messages);
		expect(threads).toHaveLength(1);
		expect(threads[0].replies).toHaveLength(9_999);
	});
});
