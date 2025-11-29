import { EmbeddedUser } from "./user";

export interface ChatsData {
  id: string;
  participants: string[];
  createdAt: number | undefined;
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
}

export type ChatType = "group" | "dm" | "me";

export interface FirestoreChatData {
  participants: string[];
  participantUids: string[];
  createdAt: number;
  type: ChatType;
  groupName?: string;
  groupImage?: string | null;
  users?: object;
  participantsSynced: boolean;
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
