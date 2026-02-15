import { defineWebSocketHandler } from "h3";
import type { ClientMessage, ServerMessage } from "../lib/message-types";
import {
	addUser,
	removeUser,
	getUser,
	changeNick,
	changeColor,
	getRoomUsers,
	findPeerByNick,
} from "../lib/room-manager";

function send(peer: { send: (data: string) => void }, msg: ServerMessage) {
	peer.send(JSON.stringify(msg));
}

function broadcast(
	peer: { publish: (channel: string, data: string) => void; send: (data: string) => void },
	channel: string,
	msg: ServerMessage,
) {
	const data = JSON.stringify(msg);
	peer.publish(channel, data);
	peer.send(data);
}

export default defineWebSocketHandler({
	open(_peer) {
		// Peer connected but hasn't joined a room yet
	},

	message(peer, rawMessage) {
		let msg: ClientMessage;
		try {
			msg = JSON.parse(rawMessage.text());
		} catch {
			send(peer, { type: "error", text: "Invalid message format" });
			return;
		}

		if (msg.type === "join") {
			// Leave old room if any
			const existing = getUser(peer.id);
			if (existing) {
				peer.publish(`room:${existing.room}`, JSON.stringify({
					type: "user-left",
					nick: existing.nick,
				} satisfies ServerMessage));
				peer.unsubscribe(`room:${existing.room}`);
				peer.unsubscribe(`pm:${peer.id}`);
				removeUser(peer.id);
			}

			const user = addUser(peer.id, msg.room, msg.nick, msg.color);
			peer.subscribe(`room:${msg.room}`);
			peer.subscribe(`pm:${peer.id}`);

			// Tell the joiner about the room
			send(peer, {
				type: "user-list",
				users: getRoomUsers(msg.room),
			});
			send(peer, {
				type: "system",
				text: `Welcome to #${msg.room}! You are ${user.nick}`,
				timestamp: Date.now(),
			});

			// Tell everyone else
			peer.publish(
				`room:${msg.room}`,
				JSON.stringify({
					type: "user-joined",
					user: { nick: user.nick, color: user.color },
				} satisfies ServerMessage),
			);
			return;
		}

		const user = getUser(peer.id);
		if (!user) {
			send(peer, { type: "error", text: "You must join a room first" });
			return;
		}

		const channel = `room:${user.room}`;

		switch (msg.type) {
			case "chat":
				broadcast(peer, channel, {
					type: "chat",
					nick: user.nick,
					text: msg.text,
					color: user.color,
					timestamp: Date.now(),
				});
				break;

			case "nick": {
				const result = changeNick(peer.id, msg.nick);
				if (result.ok) {
					broadcast(peer, channel, {
						type: "nick-changed",
						oldNick: result.oldNick,
						newNick: msg.nick,
					});
					// Send updated user list to everyone
					const users = getRoomUsers(user.room);
					broadcast(peer, channel, { type: "user-list", users });
				} else {
					send(peer, { type: "error", text: result.error });
				}
				break;
			}

			case "color": {
				changeColor(peer.id, msg.color);
				send(peer, {
					type: "system",
					text: `Color changed to ${msg.color}`,
					timestamp: Date.now(),
				});
				// Update user list for all
				const users = getRoomUsers(user.room);
				broadcast(peer, channel, { type: "user-list", users });
				break;
			}

			case "giphy":
				broadcast(peer, channel, {
					type: "giphy",
					nick: user.nick,
					url: msg.url,
					query: msg.query,
					color: user.color,
					timestamp: Date.now(),
				});
				break;

			case "code":
				broadcast(peer, channel, {
					type: "code",
					nick: user.nick,
					text: msg.text,
					language: msg.language,
					color: user.color,
					timestamp: Date.now(),
				});
				break;

			case "list":
				send(peer, {
					type: "user-list",
					users: getRoomUsers(user.room),
				});
				break;

			case "pm": {
				const targetPeerId = findPeerByNick(msg.to, user.room);
				if (!targetPeerId) {
					send(peer, {
						type: "error",
						text: `User "${msg.to}" not found`,
					});
					break;
				}
				const pmMsg: ServerMessage = {
					type: "pm",
					from: user.nick,
					to: msg.to,
					text: msg.text,
					color: user.color,
					timestamp: Date.now(),
				};
				// Send to target
				peer.publish(`pm:${targetPeerId}`, JSON.stringify(pmMsg));
				// Echo back to sender
				send(peer, pmMsg);
				break;
			}
		}
	},

	close(peer) {
		const user = removeUser(peer.id);
		if (user) {
			peer.publish(
				`room:${user.room}`,
				JSON.stringify({
					type: "user-left",
					nick: user.nick,
				} satisfies ServerMessage),
			);
		}
	},
});
