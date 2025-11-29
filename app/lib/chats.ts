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
  orderBy,
} from "firebase/firestore";
import dayjs from "dayjs";
import {
  ChatMessage,
  ChatsData,
  ChatType,
  FirestoreChatData,
} from "../types/chat";
import { EmbeddedUser } from "../types/user";
import { useCollection } from "react-firebase-hooks/firestore";

function embedLocalUser(
  uid: string | null,
  email: string,
  photoURL?: string | null,
  name?: string | null
): EmbeddedUser {
  return {
    uid,
    email,
    photoURL: photoURL ?? null,
    name: name ?? null,
  };
}

function embedRemoteUser(email: string): EmbeddedUser {
  return {
    uid: null,
    email,
    photoURL: null,
    name: null,
  };
}

function docToChat(
  doc: QueryDocumentSnapshot<DocumentData>,
  currentEmail?: string
): ChatsData {
  const d = doc.data() as Partial<FirestoreChatData>;

  const participants = Array.isArray(d.participants) ? d.participants : [];
  const participantUids = Array.isArray(d.participantUids)
    ? d.participantUids
    : [];
  const users = (d.users as Record<string, EmbeddedUser>) || {};

  let otherUserEmail: string | null = null;
  let otherUserName: string | null = null;
  let photoURL: string | null = null;

  if (currentEmail) {
    if (d.type === "dm") {
      otherUserEmail = participants.find((p) => p !== currentEmail) || null;
      if (otherUserEmail) {
        console.log("asdasdasd");
        otherUserName = users[otherUserEmail]?.name ?? otherUserEmail;
        photoURL = users[otherUserEmail]?.photoURL ?? null;
        console.log("kkkkk", photoURL);
      }
    } else if (d.type === "me") {
      photoURL = users[currentEmail]?.photoURL ?? null;
    }
  }

  return {
    id: doc.id,
    type: (d.type as ChatsData["type"]) || "dm",
    participants,
    participantUids,
    participantsSynced: participantUids.length === participants.length,
    createdAt: d.createdAt,
    users,
    groupName: typeof d.groupName === "string" ? d.groupName : null,
    groupImage: typeof d.groupImage === "string" ? d.groupImage : null,
    otherUserEmail,
    otherUserName,
    photoURL,
  };
}

export async function createOrGetChat({
  type,
  currentEmail,
  currentUid,
  currentPhoto,
  currentName,
  otherEmails = [],
  groupName,
  groupImage,
}: {
  type: ChatType;
  currentEmail: string;
  currentUid: string;
  currentPhoto?: string | null;
  currentName?: string | null;
  otherEmails?: string[];
  groupName?: string;
  groupImage?: string;
}): Promise<ChatsData> {
  const chatsRef = collection(db, "chats");

  const localUserObj = embedLocalUser(
    currentUid,
    currentEmail,
    currentPhoto,
    currentName
  );

  if (type === "me") {
    const q = query(
      chatsRef,
      where("participants", "==", [currentEmail]),
      where("type", "==", "me")
    );

    const snap = await getDocs(q);
    if (!snap.empty) return docToChat(snap.docs[0], currentEmail);

    const payload: FirestoreChatData = {
      type: "me",
      participants: [currentEmail],
      participantUids: [currentUid],
      participantsSynced: true,
      createdAt: Date.now(),
      users: {
        [currentEmail]: localUserObj,
      },
    };

    const newDoc = await addDoc(chatsRef, payload);
    const final = await getDocs(
      query(chatsRef, where("__name__", "==", newDoc.id))
    );
    return docToChat(final.docs[0], currentEmail);
  }

  if (type === "dm") {
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

    if (existing) return docToChat(existing, currentEmail);

    const payload: FirestoreChatData = {
      type: "dm",
      participants: [currentEmail, otherEmail],
      participantUids: [currentUid],
      participantsSynced: false,
      createdAt: Date.now(),
      users: {
        [currentEmail]: localUserObj,
        [otherEmail]: embedRemoteUser(otherEmail),
      },
    };

    const newDoc = await addDoc(chatsRef, payload);
    const final = await getDocs(
      query(chatsRef, where("__name__", "==", newDoc.id))
    );
    return docToChat(final.docs[0], currentEmail);
  }

  if (type === "group") {
    const all = [currentEmail, ...otherEmails].sort();

    const q = query(
      chatsRef,
      where("participants", "array-contains", currentEmail),
      where("type", "==", "group")
    );

    const snap = await getDocs(q);

    const existing = snap.docs.find((doc) => {
      const data = doc.data() as FirestoreChatData;
      const arr = [...(data.participants || [])].sort();
      return arr.length === all.length && arr.every((x, i) => x === all[i]);
    });

    if (existing) return docToChat(existing, currentEmail);

    const usersObj: Record<string, EmbeddedUser> = {};

    for (const email of all) {
      usersObj[email] =
        email === currentEmail ? localUserObj : embedRemoteUser(email);
    }

    const payload: FirestoreChatData = {
      type: "group",
      participants: all,
      participantUids: [currentUid],
      participantsSynced: false,
      createdAt: Date.now(),
      groupName: groupName ?? "New Group",
      groupImage: groupImage ?? null,
      users: usersObj,
    };

    const newDoc = await addDoc(chatsRef, payload);
    const final = await getDocs(
      query(chatsRef, where("__name__", "==", newDoc.id))
    );
    return docToChat(final.docs[0], currentEmail);
  }

  throw new Error("Invalid chat type");
}

export async function getUserChats(userEmail: string): Promise<ChatsData[]> {
  const snapshot = await getDocs(
    query(
      collection(db, "chats"),
      where("participants", "array-contains", userEmail)
    )
  );

  return snapshot.docs.map((docSnap) => docToChat(docSnap, userEmail));
}

export async function updateUserInChats({
  uid,
  email,
  photoURL,
  name,
}: EmbeddedUser) {
  const chatsQ = query(
    collection(db, "chats"),
    where("participants", "array-contains", email),
    where("participantsSynced", "==", false)
  );

  const snaps = await getDocs(chatsQ);

  const userObj: EmbeddedUser = {
    uid: uid ?? null,
    email,
    photoURL: photoURL ?? null,
    name: name ?? null,
  };

  await Promise.all(
    snaps.docs.map(async (docSnap) => {
      const docRef = docSnap.ref;
      const data = docSnap.data();

      const uids: string[] = Array.isArray(data.participantUids)
        ? [...data.participantUids]
        : [];

      if (uid && !uids.includes(uid)) uids.push(uid);

      const users: Record<string, EmbeddedUser> = { ...(data.users || {}) };
      users[email] = userObj;

      await setDoc(
        docRef,
        {
          users,
          participantUids: uids,
          participantsSynced: uids.length === (data.participants?.length ?? 0),
        },
        { merge: true }
      );
    })
  );
}

export function useChatMessages(chatId: string | undefined) {
  const messagesRef = chatId
    ? collection(db, "chats", chatId, "messages")
    : null;

  const messagesQuery = messagesRef
    ? query(messagesRef, orderBy("timestamp", "asc"))
    : null;

  const [snapshot, loading] = useCollection(messagesQuery);

  const messages: ChatMessage[] = snapshot
    ? snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<ChatMessage, "id">),
      }))
    : [];

  return { messages, loading };
}

export async function sendChatMessage(
  chatId: string,
  message: Omit<ChatMessage, "id">
) {
  const messagesRef = collection(db, "chats", chatId, "messages");

  const docRef = await addDoc(messagesRef, {
    ...message,
    timestamp: dayjs().toDate(),
  });

  return docRef;
}
