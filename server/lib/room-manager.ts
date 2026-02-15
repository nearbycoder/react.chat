import type { UserInfo } from "./message-types";

interface User {
	nick: string;
	color: string;
	room: string;
}

const users = new Map<string, User>();
const rooms = new Map<string, Set<string>>();

const DEFAULT_COLORS = [
	"#e74c3c",
	"#3498db",
	"#2ecc71",
	"#f39c12",
	"#9b59b6",
	"#1abc9c",
	"#e67e22",
	"#e91e63",
];

function getUsedColors(room: string): Set<string> {
	const members = rooms.get(room);
	if (!members) return new Set();
	const used = new Set<string>();
	for (const peerId of members) {
		const user = users.get(peerId);
		if (user) used.add(user.color);
	}
	return used;
}

function randomColor(room: string): string {
	const used = getUsedColors(room);
	const available = DEFAULT_COLORS.filter((c) => !used.has(c));
	const pool = available.length > 0 ? available : DEFAULT_COLORS;
	return pool[Math.floor(Math.random() * pool.length)];
}

function generateNick(): string {
	return `Anon_${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
}

function isNickTaken(nick: string, room: string, excludePeerId?: string): boolean {
	const members = rooms.get(room);
	if (!members) return false;
	for (const peerId of members) {
		if (peerId === excludePeerId) continue;
		const user = users.get(peerId);
		if (user && user.nick.toLowerCase() === nick.toLowerCase()) return true;
	}
	return false;
}

export function addUser(peerId: string, room: string, nick?: string, color?: string): User {
	let finalNick = nick || generateNick();
	if (isNickTaken(finalNick, room)) {
		finalNick = generateNick();
	}
	const finalColor = color || randomColor(room);
	const user: User = { nick: finalNick, color: finalColor, room };
	users.set(peerId, user);

	if (!rooms.has(room)) {
		rooms.set(room, new Set());
	}
	rooms.get(room)!.add(peerId);

	return user;
}

export function removeUser(peerId: string): User | undefined {
	const user = users.get(peerId);
	if (!user) return undefined;

	const room = rooms.get(user.room);
	if (room) {
		room.delete(peerId);
		if (room.size === 0) {
			rooms.delete(user.room);
		}
	}
	users.delete(peerId);
	return user;
}

export function getUser(peerId: string): User | undefined {
	return users.get(peerId);
}

export function changeNick(peerId: string, newNick: string): { ok: true; oldNick: string } | { ok: false; error: string } {
	const user = users.get(peerId);
	if (!user) return { ok: false, error: "Not in a room" };

	if (isNickTaken(newNick, user.room, peerId)) {
		return { ok: false, error: `Nick "${newNick}" is already taken` };
	}

	const oldNick = user.nick;
	user.nick = newNick;
	return { ok: true, oldNick };
}

export function changeColor(peerId: string, color: string): boolean {
	const user = users.get(peerId);
	if (!user) return false;
	user.color = color;
	return true;
}

export function getRoomUsers(room: string): UserInfo[] {
	const members = rooms.get(room);
	if (!members) return [];
	const result: UserInfo[] = [];
	for (const peerId of members) {
		const user = users.get(peerId);
		if (user) {
			result.push({ nick: user.nick, color: user.color });
		}
	}
	return result.sort((a, b) => a.nick.localeCompare(b.nick));
}

export function findPeerByNick(nick: string, room: string): string | undefined {
	const members = rooms.get(room);
	if (!members) return undefined;
	for (const peerId of members) {
		const user = users.get(peerId);
		if (user && user.nick.toLowerCase() === nick.toLowerCase()) {
			return peerId;
		}
	}
	return undefined;
}
