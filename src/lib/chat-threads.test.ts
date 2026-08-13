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

	it("keeps replies with unavailable roots in the main stream", () => {
		const message = { id: "orphan", replyTo: "missing" };

		expect(buildMessageThreads([message])).toEqual([{ message, replies: [] }]);
	});
});
