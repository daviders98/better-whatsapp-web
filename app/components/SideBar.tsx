"use client";
import { useEffect, useState } from "react";
import { auth } from "../../firebaseConfig";
import { useAuthState } from "react-firebase-hooks/auth";
import Image from "next/image";
import { createOrGetChat, getUserChats } from "@/app/lib/chats";
import { ChatsData } from "../types/chat";
import { AuthUser } from "../types/user";
import { EllipsisVertical, LogOut, MessageSquarePlus } from "lucide-react";
import { signOut } from "firebase/auth";

export default function Sidebar({
  onSelectChat,
}: {
  onSelectChat: (id: string) => void;
}) {
  const [user] = useAuthState(auth);
  const [chats, setChats] = useState<ChatsData[]>([]);
  const [showMenu, setShowMenu] = useState(false);

  const fetchChats = async (user: AuthUser) => {
    if (user) {
      const userChats = await getUserChats(user.email!);
      setChats(userChats);
    }
  };

  useEffect(() => {
    if (!user) return;
    const getChats = async () => {
      await fetchChats(user);
    };
    getChats();
  }, [user]);

  const handleNewChat = async () => {
    const email = prompt("Enter the user's email to chat with:");
    if (!email) return;
    try {
      const chatId = await createOrGetChat(user!.email!, email);
      await fetchChats(user);
      onSelectChat(chatId);
    } catch (e) {
      alert("Unable to create chat.");
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <aside className="p-4 space-y-4 relative">
      <div className="rounded flex items-center justify-between gap-3 text-gray-800 dark:text-gray-100">
        <div className="flex items-center justify-between w-full space-x-3 md:space-x-5">
          <div className="flex items-center">
            <Image width={48} height={48} alt="logo" src="/images/logo.png" />
            <h1 className="text-xl font-extrabold">Better WhatsApp</h1>
          </div>

          <div className="flex space-x-4 md:space-x-2 relative">
            <div className="flex space-x-4 md:space-x-2">
              <div
                className="rounded-full hover:bg-gray-700 p-2 cursor-pointer"
                onClick={handleNewChat}
              >
                <MessageSquarePlus className="w-6 h-6" />
              </div>

              <div className="relative">
                <div
                  className="rounded-full hover:bg-gray-700 p-2 cursor-pointer"
                  onClick={() => setShowMenu((prev) => !prev)}
                >
                  <EllipsisVertical className="w-6 h-6" />
                </div>

                {showMenu && (
                  <div className="absolute right-0 mt-2 bg-white dark:bg-gray-800 shadow-md rounded-xl w-32 p-2 z-50 select-none">
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl flex justify-between cursor-pointer"
                    >
                      <LogOut className="w-6 h-6" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-2 mt-6 select-none">
        {chats.map((chat) => (
          <div
            key={chat.id}
            onClick={() => onSelectChat(chat.id)}
            className="p-3 rounded cursor-pointer hover:bg-gray-200 dark:hover:bg-[#2a3942] transition text-gray-800 dark:text-gray-100"
          >
            <p className="font-medium text-ellipsis overflow-clip">
              {chat.otherUserName} {chat.isSelfChat ? "(me)" : ""}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {chat.otherUserEmail}
            </p>
          </div>
        ))}
      </div>
    </aside>
  );
}
