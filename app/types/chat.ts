export interface ChatsData {
    id: string; 
    participants: string[];
    createdAt: number;
    isSelfChat?: boolean;
    otherUserEmail: string;
    otherUserName: string;
}

export interface FirestoreChatData {
  participants: string[];
  createdAt: number;
  isSelfChat?: boolean;
}