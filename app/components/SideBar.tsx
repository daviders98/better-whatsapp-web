"use client";
import { useEffect, useState } from "react";
import { auth } from "../../firebaseConfig";
import { useAuthState } from "react-firebase-hooks/auth";
import Image from "next/image";
import { createOrGetChat, getUserChats } from "@/app/lib/chats";
import { ChatsData } from "../types/chat";
import { AuthUser } from "../types/user";
import { EllipsisVertical, LogOut, MessageSquarePlus } from "lucide-react";
import { signOut, User } from "firebase/auth";

export default function Sidebar({
  onSelectChat,
}: {
  onSelectChat: (chatData: ChatsData) => void;
}) {
  const [user, loading] = useAuthState(auth);
  const [chats, setChats] = useState<ChatsData[]>([]);
  const [showMenu, setShowMenu] = useState(false);

  const fetchChats = async (user: AuthUser) => {
    if (!user) return;
    const userChats = await getUserChats(user.email!);
    setChats(userChats);
  };

  useEffect(() => {
    if (!user) return;
    const getChats = async () => {
      await fetchChats(user);
    };
    getChats();
  }, [user]);

  const handleNewChat = async (user: User) => {
    const email = prompt("Enter the user's email to chat with:");
    if (!email) return;

    try {
      const chatData = await createOrGetChat({
        currentEmail: user.email,
        currentPhoto: user.photoURL,
        type: email === user.email ? "me" : "dm",
        otherEmails: email === user.email ? [] : [email],
      });

      await fetchChats(user);
      onSelectChat(chatData as ChatsData);
    } catch (e) {
      alert("Unable to create chat.");
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  const getChatDisplay = (chat: ChatsData, currentEmail: string) => {
    const users = chat.users || {};

    if (chat.type === "me") {
      const self = users[currentEmail];
      return {
        name: currentEmail,
        photoURL: self?.photoURL || "/images/default-me.png",
      };
    }

    if (chat.type === "dm") {
      const other = Object.values(users).find((u) => u.email !== currentEmail);

      return {
        name: other?.name || other?.email,
        photoURL: other?.photoURL || "/images/default-avatar.png",
      };
    }

    if (chat.type === "group") {
      return {
        name: chat.groupName || "Unnamed Group",
        photoURL: chat.groupImage || "/images/default-group.png",
      };
    }

    return { name: "Unknown Chat", photoURL: "/images/default-avatar.png" };
  };

  return (
    <>
      {!loading && user && (
        <aside className="p-4 space-y-4 relative">
          <div className="rounded flex items-center justify-between gap-3 text-gray-800 dark:text-gray-100">
            <div className="flex items-center justify-between w-full space-x-3 md:space-x-5">
              <div className="flex items-center">
                <Image
                  width={48}
                  height={48}
                  alt="logo"
                  src="/images/logo.png"
                />
                <h1 className="text-xl font-extrabold">Better WhatsApp</h1>
              </div>

              <div className="flex space-x-2 relative">
                <div
                  className="rounded-full hover:bg-gray-700 p-2 cursor-pointer"
                  onClick={() => handleNewChat(user)}
                >
                  <MessageSquarePlus className="w-6 h-6" />
                </div>

                <div className="relative">
                  <div
                    className="rounded-full hover:bg-gray-700 p-2 cursor-pointer"
                    onClick={() => setShowMenu((p) => !p)}
                  >
                    <EllipsisVertical className="w-6 h-6" />
                  </div>

                  {showMenu && (
                    <div className="absolute right-0 mt-2 bg-white dark:bg-gray-800 shadow-md rounded-xl w-32 p-2 z-50">
                      <button
                        onClick={handleLogout}
                        className="w-full text-left text-md px-2 py-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl flex justify-between select-none"
                      >
                        <LogOut className="w-5 h-5" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2 mt-6 select-none">
            {chats.map((chat) => {
              const display = getChatDisplay(chat, user.email!);

              return (
                <div
                  key={chat.id}
                  onClick={() => onSelectChat(chat)}
                  className="p-2 rounded-xl cursor-pointer hover:bg-gray-200 dark:hover:bg-[#2a3942] transition text-gray-800 dark:text-gray-100 flex items-center"
                >
                  <div className="w-12 h-12 relative shrink-0 select-none">
                    <Image
                      src={display.photoURL}
                      alt="chat image"
                      fill
                      className="rounded-full object-cover"
                    />
                  </div>
                  <p className="font-medium ml-4 text-ellipsis overflow-hidden">
                    {display.name} {chat.type == "me" && `(me)`}
                  </p>
                </div>
              );
            })}
          </div>
        </aside>
      )}
    </>
  );
}
