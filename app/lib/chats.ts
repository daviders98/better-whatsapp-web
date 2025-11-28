import { db } from "@/firebaseConfig";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  DocumentData,
  QueryDocumentSnapshot,
  setDoc,
} from "firebase/firestore";
import { ChatsData, ChatType, FirestoreChatData } from "../types/chat";
import { EmbeddedUser } from "../types/user";

function docToChat(doc: QueryDocumentSnapshot<DocumentData>): ChatsData {
  const d = doc.data() as Partial<FirestoreChatData>;

  return {
    id: doc.id,
    type: (d.type as ChatsData["type"]) || "dm",
    participants: Array.isArray(d.participants) ? d.participants : [],
    createdAt: d.createdAt,
    users: (d.users as Record<string, EmbeddedUser>) || {},
    groupName: typeof d.groupName === "string" ? d.groupName : null,
    groupImage: typeof d.groupImage === "string" ? d.groupImage : null,
  };
}

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
}): Promise<ChatsData> {
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

      if (!snap.empty) {
        return docToChat(snap.docs[0]);
      }

      const payload: FirestoreChatData = {
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
      };

      const newChat = await addDoc(chatsRef, payload);
      return {
        id: newChat.id,
        type: payload.type,
        participants: payload.participants,
        createdAt: payload.createdAt,
        users: payload.users,
        groupName: null,
        groupImage: null,
      } as ChatsData;
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
          Array.isArray(data.participants) &&
          data.participants.length === 2 &&
          data.participants.includes(otherEmail)
        );
      });

      if (existing) {
        return docToChat(existing);
      }

      const payload: FirestoreChatData = {
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
      };

      const newChat = await addDoc(chatsRef, payload);
      return {
        id: newChat.id,
        type: payload.type,
        participants: payload.participants,
        createdAt: payload.createdAt,
        users: payload.users,
        groupName: null,
        groupImage: null,
      } as ChatsData;
    }

    if (type === "group") {
      const allParticipants = [currentEmail, ...otherEmails]
        .filter(Boolean)
        .sort();

      const q = query(
        chatsRef,
        where("participants", "array-contains", currentEmail),
        where("type", "==", "group")
      );

      const snap = await getDocs(q);

      const existing = snap.docs.find((doc) => {
        const data = doc.data() as FirestoreChatData;
        const participants = Array.isArray(data.participants)
          ? [...data.participants].sort()
          : [];
        return (
          participants.length === allParticipants.length &&
          participants.every((p, i) => p === allParticipants[i])
        );
      });

      if (existing) {
        return docToChat(existing);
      }

      const usersObj: Record<string, EmbeddedUser> = {};
      for (const email of allParticipants) {
        if (email) usersObj[email] = { email, photoURL: null };
      }

      const payload: FirestoreChatData = {
        type: "group",
        participants: allParticipants,
        groupName: groupName ?? "New Group",
        groupImage: groupImage ?? null,
        createdAt: Date.now(),
        users: usersObj,
      };

      const newChat = await addDoc(chatsRef, payload);
      return {
        id: newChat.id,
        type: payload.type,
        participants: payload.participants,
        createdAt: payload.createdAt,
        users: payload.users,
        groupName: payload.groupName ?? null,
        groupImage: payload.groupImage ?? null,
      } as ChatsData;
    }

    throw new Error("Invalid chat type.");
  } catch (e) {
    console.error("createOrGetChat error:", e);
    throw e;
  }
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
