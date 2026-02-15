// Client -> Server message types
export type ClientMessage =
	| { type: "join"; room: string; nick?: string; color?: string }
	| { type: "chat"; text: string }
	| { type: "nick"; nick: string }
	| { type: "color"; color: string }
	| { type: "giphy"; url: string; query: string }
	| { type: "code"; text: string; language?: string }
	| { type: "list" }
	| { type: "pm"; to: string; text: string };

// Server -> Client message types
export type ServerMessage =
	| {
			type: "chat";
			nick: string;
			text: string;
			color: string;
			timestamp: number;
	  }
	| { type: "system"; text: string; timestamp: number }
	| {
			type: "pm";
			from: string;
			to: string;
			text: string;
			color: string;
			timestamp: number;
	  }
	| {
			type: "giphy";
			nick: string;
			url: string;
			query: string;
			color: string;
			timestamp: number;
	  }
	| {
			type: "code";
			nick: string;
			text: string;
			language?: string;
			color: string;
			timestamp: number;
	  }
	| { type: "user-list"; users: UserInfo[] }
	| { type: "user-joined"; user: UserInfo }
	| { type: "user-left"; nick: string }
	| { type: "nick-changed"; oldNick: string; newNick: string }
	| { type: "error"; text: string };

export interface UserInfo {
	nick: string;
	color: string;
}
