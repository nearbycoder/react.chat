import {
	createContext,
	useContext,
	useReducer,
	type Dispatch,
	type ReactNode,
} from "react";
import { createElement } from "react";
import type { ServerMessage, UserInfo } from "../../server/lib/message-types";

export interface ChatMessage {
	id: string;
	type: ServerMessage["type"];
	nick?: string;
	text?: string;
	color?: string;
	from?: string;
	to?: string;
	url?: string;
	query?: string;
	language?: string;
	oldNick?: string;
	newNick?: string;
	timestamp: number;
}

export interface ChatState {
	messages: ChatMessage[];
	users: UserInfo[];
	nick: string;
	color: string;
	room: string;
	connected: boolean;
	unreadCount: number;
	showHelp: boolean;
	sentHistory: string[];
}

export type ChatAction =
	| { type: "server-message"; message: ServerMessage }
	| { type: "set-connected"; connected: boolean }
	| { type: "set-room"; room: string }
	| { type: "set-nick"; nick: string }
	| { type: "clear-messages" }
	| { type: "toggle-help" }
	| { type: "reset-unread" }
	| { type: "add-sent"; text: string };

let messageIdCounter = 0;
function nextId(): string {
	return `msg-${++messageIdCounter}`;
}

function serverMessageToChatMessage(msg: ServerMessage): ChatMessage {
	const base = { id: nextId(), type: msg.type, timestamp: Date.now() };

	switch (msg.type) {
		case "chat":
			return {
				...base,
				nick: msg.nick,
				text: msg.text,
				color: msg.color,
				timestamp: msg.timestamp,
			};
		case "system":
			return { ...base, text: msg.text, timestamp: msg.timestamp };
		case "pm":
			return {
				...base,
				from: msg.from,
				to: msg.to,
				text: msg.text,
				color: msg.color,
				timestamp: msg.timestamp,
			};
		case "giphy":
			return {
				...base,
				nick: msg.nick,
				url: msg.url,
				query: msg.query,
				color: msg.color,
				timestamp: msg.timestamp,
			};
		case "code":
			return {
				...base,
				nick: msg.nick,
				text: msg.text,
				language: msg.language,
				color: msg.color,
				timestamp: msg.timestamp,
			};
		case "nick-changed":
			return {
				...base,
				oldNick: msg.oldNick,
				newNick: msg.newNick,
				timestamp: Date.now(),
			};
		case "error":
			return { ...base, text: msg.text, timestamp: Date.now() };
		default:
			return { ...base, timestamp: Date.now() };
	}
}

const MAX_HISTORY = 10;

function chatReducer(state: ChatState, action: ChatAction): ChatState {
	switch (action.type) {
		case "server-message": {
			const msg = action.message;

			switch (msg.type) {
				case "user-list": {
					// Pick up our own color from the user list
					const me = msg.users.find(
						(u) =>
							u.nick.toLowerCase() === state.nick.toLowerCase(),
					);
					const newColor = me?.color ?? state.color;
					if (newColor && typeof window !== "undefined") {
						localStorage.setItem("react-chat-color", newColor);
					}
					return {
						...state,
						users: msg.users,
						color: newColor,
					};
				}
				case "user-joined":
					return {
						...state,
						users: [...state.users, msg.user].sort((a, b) =>
							a.nick.localeCompare(b.nick),
						),
						messages: [
							...state.messages,
							{
								id: nextId(),
								type: "system",
								text: `${msg.user.nick} joined the room`,
								timestamp: Date.now(),
							},
						],
					};
				case "user-left":
					return {
						...state,
						users: state.users.filter(
							(u) => u.nick.toLowerCase() !== msg.nick.toLowerCase(),
						),
						messages: [
							...state.messages,
							{
								id: nextId(),
								type: "system",
								text: `${msg.nick} left the room`,
								timestamp: Date.now(),
							},
						],
					};
				case "nick-changed": {
					const chatMsg = serverMessageToChatMessage(msg);
					chatMsg.text = `${msg.oldNick} is now ${msg.newNick}`;
					chatMsg.type = "system";
					const isMe =
						state.nick.toLowerCase() === msg.oldNick.toLowerCase();
					const newNick = isMe ? msg.newNick : state.nick;
					if (isMe && typeof window !== "undefined") {
						localStorage.setItem("react-chat-nick", msg.newNick);
					}
					return {
						...state,
						nick: newNick,
						messages: [...state.messages, chatMsg],
					};
				}
				default: {
					const chatMsg = serverMessageToChatMessage(msg);
					const isActive =
						typeof document !== "undefined" ? !document.hidden : true;
					return {
						...state,
						messages: [...state.messages, chatMsg],
						unreadCount: isActive
							? state.unreadCount
							: state.unreadCount + 1,
					};
				}
			}
		}
		case "set-connected":
			return { ...state, connected: action.connected };
		case "set-room":
			return { ...state, room: action.room };
		case "set-nick":
			return { ...state, nick: action.nick };
		case "clear-messages":
			return { ...state, messages: [] };
		case "toggle-help":
			return { ...state, showHelp: !state.showHelp };
		case "reset-unread":
			return { ...state, unreadCount: 0 };
		case "add-sent":
			return {
				...state,
				sentHistory: [
					...state.sentHistory.slice(-MAX_HISTORY + 1),
					action.text,
				],
			};
		default:
			return state;
	}
}

const initialState: ChatState = {
	messages: [],
	users: [],
	nick: "",
	color: "",
	room: "",
	connected: false,
	unreadCount: 0,
	showHelp: false,
	sentHistory: [],
};

const ChatStateContext = createContext<ChatState>(initialState);
const ChatDispatchContext = createContext<Dispatch<ChatAction>>(() => {});

export function ChatProvider({ children }: { children: ReactNode }) {
	const [state, dispatch] = useReducer(chatReducer, initialState);
	return createElement(
		ChatStateContext.Provider,
		{ value: state },
		createElement(ChatDispatchContext.Provider, { value: dispatch }, children),
	);
}

export function useChatState() {
	return useContext(ChatStateContext);
}

export function useChatDispatch() {
	return useContext(ChatDispatchContext);
}
