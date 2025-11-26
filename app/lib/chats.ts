import { db } from "@/firebaseConfig";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  doc,
  getDoc,
} from "firebase/firestore";
import { ChatsData, FirestoreChatData } from "../types/chat";

export async function createOrGetChat(currentEmail: string, otherEmail: string) {
  const chatsRef = collection(db, "chats");

  if (currentEmail === otherEmail) {
    const q = query(
      chatsRef,
      where("participants", "==", [currentEmail])
    );
    const snap = await getDocs(q);

    if (!snap.empty) {
      return snap.docs[0].id;
    }

    const newChat = await addDoc(chatsRef, {
      participants: [currentEmail],
      createdAt: Date.now(),
      isSelfChat: true,
    });

    return newChat.id;
  }

  const q = query(
    chatsRef,
    where("participants", "array-contains", currentEmail)
  );

  const snapshot = await getDocs(q);

  const existing = snapshot.docs.find((doc) => {
    const data = doc.data();
    return (
      data.participants.length === 2 &&
      data.participants.includes(otherEmail)
    );
  });

  if (existing) return existing.id;

  const newChat = await addDoc(chatsRef, {
    participants: [currentEmail, otherEmail],
    createdAt: Date.now(),
  });

  return newChat.id;
}

export async function getChatOtherUser(chatId: string, currentEmail: string | null) {
  const chatRef = doc(db, "chats", chatId);
  const chatSnap = await getDoc(chatRef);

  if (!chatSnap.exists()) return null;

  const participants = chatSnap.data().participants as string[];

  if (participants.length === 1) return currentEmail;

  return participants.find((u) => u !== currentEmail) || currentEmail;
}

export async function getUserChats(userEmail: string): Promise<ChatsData[]> {
  const snapshot = await getDocs(
    query(collection(db, "chats"), where("participants", "array-contains", userEmail))
  );

  return snapshot.docs.map((doc) => {
    const data = doc.data() as FirestoreChatData;
    const other = data.participants.find((p) => p !== userEmail) || userEmail;

    return {
      id: doc.id,
      otherUserEmail: data.isSelfChat ? userEmail : other,
      otherUserName: data.isSelfChat ? userEmail : other,
      ...data,
    };
  });
}
