import { db } from "@/firebaseConfig";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  doc,
  getDoc,
  setDoc,
} from "firebase/firestore";
import { ChatsData, ChatType, FirestoreChatData } from "../types/chat";
import { EmbeddedUser } from "../types/user";

export async function createOrGetChat({
  type,
  currentEmail,
  currentPhoto,
  otherEmails = [],
  groupName,
  groupImage,
}: {
  type: ChatType;
  currentEmail: string | null | undefined;
  otherEmails?: string[];
  groupName?: string;
  groupImage?: string;
  currentPhoto?: string | null | undefined;
}) {
  if (!currentEmail) throw new Error("currentEmail is required");

  try {
    const chatsRef = collection(db, "chats");

    if (type === "me") {
      const q = query(
        chatsRef,
        where("participants", "==", [currentEmail]),
        where("type", "==", "me")
      );

      const snap = await getDocs(q);
      if (!snap.empty) return snap.docs[0].id;

      const newChat = await addDoc(chatsRef, {
        type: "me",
        participants: [currentEmail],
        createdAt: Date.now(),
        users: {
          [currentEmail]: {
            email: currentEmail,
            photoURL: currentPhoto ?? null,
            name: "You",
          } as EmbeddedUser,
        },
      });

      return newChat.id;
    }

    if (type === "dm") {
      if (otherEmails.length !== 1)
        throw new Error('"dm" must have exactly one otherEmail.');

      const otherEmail = otherEmails[0];

      const q = query(
        chatsRef,
        where("participants", "array-contains", currentEmail),
        where("type", "==", "dm")
      );

      const snap = await getDocs(q);
      const existing = snap.docs.find((doc) => {
        const data = doc.data() as FirestoreChatData;
        return (
          data.participants.length === 2 &&
          data.participants.includes(otherEmail)
        );
      });

      if (existing) return existing.id;

      const newChat = await addDoc(chatsRef, {
        type: "dm",
        participants: [currentEmail, otherEmail],
        createdAt: Date.now(),
        users: {
          [currentEmail]: {
            email: currentEmail,
            photoURL: currentPhoto ?? null,
          } as EmbeddedUser,

          [otherEmail]: {
            email: otherEmail,
            photoURL: null,
          } as EmbeddedUser,
        },
      });

      return newChat.id;
    }

    if (type === "group") {
      const allParticipants = [currentEmail, ...otherEmails].sort();

      const q = query(
        chatsRef,
        where("participants", "array-contains", currentEmail),
        where("type", "==", "group")
      );

      const snap = await getDocs(q);

      const existing = snap.docs.find((doc) => {
        const data = doc.data() as FirestoreChatData;
        const participants = [...data.participants].sort();
        return (
          participants.length === allParticipants.length &&
          participants.every((p, i) => p === allParticipants[i])
        );
      });

      if (existing) return existing.id;

      const usersObj: Record<string, EmbeddedUser> = {};

      for (const email of allParticipants) {
        if (email) {
          usersObj[email] = {
            email,
            photoURL: null,
          };
        }
      }

      const newChat = await addDoc(chatsRef, {
        type: "group",
        participants: allParticipants,
        groupName: groupName ?? "New Group",
        groupImage: groupImage ?? null,
        createdAt: Date.now(),
        users: usersObj,
      });

      return newChat.id;
    }

    throw new Error("Invalid chat type.");
  } catch (e) {
    console.log(JSON.stringify(e, null, 3), new Error().stack);
    throw new Error(String(e));
  }
}

export async function getChatOtherUser(
  chatId: string,
  currentEmail: string | null
) {
  const chatRef = doc(db, "chats", chatId);
  const chatSnap = await getDoc(chatRef);

  if (!chatSnap.exists() || !currentEmail) return null;

  const users = chatSnap.data().users as Record<string, EmbeddedUser>;
  return Object.keys(users).length == 1
    ? Object.values(users).find((u) => u.email)
    : Object.values(users).find((u) => u.email !== currentEmail) || null;
}

export async function getUserChats(userEmail: string): Promise<ChatsData[]> {
  const snapshot = await getDocs(
    query(
      collection(db, "chats"),
      where("participants", "array-contains", userEmail)
    )
  );

  const result: ChatsData[] = snapshot.docs.map((docSnap) => {
    const data = docSnap.data() as FirestoreChatData;

    const users = (data.users ?? {}) as Record<string, EmbeddedUser>;

    const base = {
      ...data,
      id: docSnap.id,
      participants: data.participants ?? [],
      createdAt: data.createdAt ?? Date.now(),
      users,
    };

    if (data.type === "me") {
      return {
        ...base,
        type: "me",
        name: userEmail,
        photoURL: users[userEmail]?.photoURL ?? "/images/default-me.png",
        isSelfChat: true,
      } as ChatsData;
    }

    if (data.type === "group") {
      return {
        ...base,
        type: "group",
        name: data.groupName ?? "Unnamed Group",
        photoURL: data.groupImage ?? "/images/default-group.png",
        isSelfChat: false,
      } as ChatsData;
    }

    const otherUser = Object.values(users).find(
      (u) => u.email !== userEmail
    ) as EmbeddedUser | undefined;

    return {
      ...base,
      type: "dm",
      otherUserEmail: otherUser?.email ?? userEmail,
      otherUserName: otherUser?.name ?? otherUser?.email ?? userEmail,
      photoURL: otherUser?.photoURL ?? "/images/default-avatar.png",
      isSelfChat: false,
    } as ChatsData;
  });

  return result;
}

export async function updateUserInChats(
  email: string,
  photoURL: string | null,
  name?: string | null
) {
  if (!email) return;

  const chatsQ = query(
    collection(db, "chats"),
    where("participants", "array-contains", email)
  );
  const snaps = await getDocs(chatsQ);

  await Promise.all(
    snaps.docs.map(async (docSnap) => {
      const docRef = docSnap.ref;
      const users = docSnap.data().users ?? {};
      const current = users[email] ?? {};

      if (current.photoURL === photoURL && current.name === name) return;

      await setDoc(
        docRef,
        {
          users: {
            [email]: {
              email,
              photoURL: photoURL ?? null,
              name: name ?? current.name ?? null,
            },
          },
        },
        { merge: true }
      );
    })
  );
}
