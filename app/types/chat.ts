import { EmbeddedUser } from "./user";

export interface ChatsData {
  id: string;
  participants: string[];
  createdAt: number;
  otherUserEmail?: string;
  otherUserName?: string;
  type: ChatType;
  groupImage?: string | null | undefined;
  name?: string | null | undefined;
  photoURL?: string | null | undefined;
  users: Record<string, EmbeddedUser>;
  groupName?: string | null | undefined;
}

export type ChatType = "group" | "dm" | "me";

export interface FirestoreChatData {
  participants: string[];
  createdAt: number;
  type: ChatType;
  groupName?: string;
  groupImage?: string | null;
  users?: object;
}
