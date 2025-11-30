import { EmbeddedUser } from "./user";

export interface ChatsData {
  latestMessage?: ChatMessage;
  id: string;
  participants: string[];
  createdAt: Date | undefined;
  otherUserEmail?: string | null;
  otherUserName?: string | null;
  type: ChatType;
  groupImage?: string | null | undefined;
  name?: string | null | undefined;
  photoURL?: string | null | undefined;
  users: Record<string, EmbeddedUser>;
  groupName?: string | null | undefined;
  participantUids: string[];
  participantsSynced: boolean;
  messages?: ChatMessage[];
  latestMessageTimestamp?: Date | undefined;
}

export type ChatType = "group" | "dm" | "me";

export interface FirestoreChatData {
  participants: string[];
  participantUids: string[];
  createdAt: Date;
  type: ChatType;
  groupName?: string;
  groupImage?: string | null;
  users?: object;
  participantsSynced: boolean;
  latestMessage?: Omit<ChatMessage, "id">;
  latestMessageTimestamp?: Date | undefined;
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: string;
  timestamp?: FireBaseTimestamp;
}

export type FireBaseTimestamp = {
  type: string;
  seconds: number;
  nanoseconds?: number;
};
