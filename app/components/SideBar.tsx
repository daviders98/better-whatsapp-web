"use client";
import { useState } from "react";
import { auth } from "../../firebaseConfig";
import Image from "next/image";

import { createOrGetChat, formatTime, useUserChats } from "@/app/lib/chats";
import { ChatsData } from "../types/chat";

import { User, signOut } from "firebase/auth";
import { EllipsisVertical, LogOut, MessageSquarePlus } from "lucide-react";

export default function Sidebar({
  onSelectChat,
  user,
}: {
  onSelectChat: (chatData: ChatsData) => void;
  user: User | null;
}) {
  const [showMenu, setShowMenu] = useState(false);

  const { chats, loading } = useUserChats(user?.email ?? null);

  if (!user) {
    return <aside className="p-4 text-gray-400">Loging out...</aside>;
  }

  const handleNewChat = async (user: User) => {
    const email = prompt("Enter the user's email to chat with:");
    if (!email) return;

    try {
      const chatData = await createOrGetChat({
        currentEmail: user.email!,
        currentPhoto: user.photoURL,
        type: email === user.email ? "me" : "dm",
        otherEmails: email === user.email ? [] : [email],
        currentUid: user.uid,
      });

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

    return {
      name: chat.groupName || "Unnamed Group",
      photoURL: chat.groupImage || "/images/default-group.png",
    };
  };

  return (
    <aside className="p-4 space-y-4 relative">
      <div className="rounded flex items-center justify-between gap-3 text-gray-800 dark:text-gray-100">
        <div className="flex items-center justify-between w-full space-x-3 md:space-x-5">
          <div className="flex items-center">
            <Image width={48} height={48} alt="logo" src="/images/logo.png" />
            <h1 className="text-xl font-extrabold">Better WhatsApp</h1>
          </div>

          <div className="flex space-x-2 relative">
            <div
              className="rounded-full hover:bg-gray-700 p-2 hover:cursor-pointer"
              onClick={() => handleNewChat(user)}
            >
              <MessageSquarePlus className="w-6 h-6" />
            </div>

            <div className="relative">
              <div
                className="rounded-full hover:bg-gray-700 p-2 hover:cursor-pointer"
                onClick={() => setShowMenu((p) => !p)}
              >
                <EllipsisVertical className="w-6 h-6" />
              </div>

              {showMenu && (
                <div className="absolute right-0 bg-white dark:bg-gray-800 shadow-md rounded-lg w-32 p-2 z-50">
                  <button
                    onClick={handleLogout}
                    className="w-full text-left text-md px-2 py-2 hover:bg-gray-200 dark:hover:bg-[#291a1d] dark:hover:text-[#fb99a5] rounded-lg flex justify-between select-none hover:cursor-pointer"
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
        {!loading &&
          chats &&
          chats.map((chat) => {
            const display = getChatDisplay(chat, user.email!);

            return (
              <div
                key={chat.id}
                onClick={() => onSelectChat(chat)}
                className="p-2 rounded-xl hover:cursor-pointer hover:bg-gray-200 dark:hover:bg-[#2a3942] transition text-gray-800 dark:text-gray-100 flex items-center"
              >
                <div className="w-12 h-12 relative shrink-0 select-none">
                  <Image
                    src={display.photoURL}
                    alt="chat image"
                    fill
                    className="rounded-full object-cover"
                  />
                </div>

                <div className="ml-4 flex flex-col w-full overflow-hidden">
                  <div className="flex justify-between items-center w-full">
                    <span className="font-medium truncate">
                      {display.name}
                      {chat.type === "me" && " (me)"}
                    </span>

                    {chat.latestMessage && (
                      <span className="text-xs text-[#979696] whitespace-nowrap ml-2">
                        {formatTime({
                          ts: chat.latestMessage.timestamp!,
                          isInSideBar: true,
                        })}
                      </span>
                    )}
                  </div>

                  {chat.latestMessage?.text && (
                    <span className="text-sm text-[#979696] truncate mt-0.5">
                      {chat.latestMessage.text}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
      </div>
    </aside>
  );
}
