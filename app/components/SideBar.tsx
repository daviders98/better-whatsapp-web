"use client";
import { useEffect, useState } from "react";
import { auth } from "../../firebaseConfig";
import { useAuthState } from "react-firebase-hooks/auth";
import Image from "next/image";
import { createOrGetChat, getUserChats } from "@/app/lib/chats";
import { ChatsData } from "../types/chat";
import { AuthUser } from "../types/user";
export default function Sidebar({ onSelectChat }: { onSelectChat: (id: string) => void }) {
  const [user] = useAuthState(auth);
  const [chats, setChats] = useState<ChatsData[]>([]);

  const fetchChats = async (user: AuthUser)=>{
    if(user){
        const userChats= await getUserChats(user.email!);
        console.log(userChats)
        setChats(userChats);
    }
  }
  useEffect(() => {
    if (!user) return;
    const getChats = async () =>{
        await fetchChats(user)
    }
    getChats()
  }, [user]);

  const handleNewChat = async () => {
    const email = prompt("Enter the user's email to chat with:");
    if (!email) return;
    try {
      const chatId = await createOrGetChat(user!.email!, email);
      await fetchChats(user)
      onSelectChat(chatId);
    } catch (e) {
      console.log(e);
      alert("Unable to create chat.");
    }
  };

  return (
    <div className="p-4 space-y-4">
      <div
        className="
          p-3 rounded cursor-pointer flex items-center gap-3
          hover:bg-gray-200 dark:hover:bg-[#2a3942]
          text-gray-800 dark:text-gray-100
        "
      >
        <Image
          width={48}
          height={48}
          src={user?.photoURL || "/default-avatar.png"}
          alt={`${user?.displayName}`}
          className="w-10 h-10 rounded-full object-cover"
        />
        <span>{user?.displayName}</span>
      </div>

      <button
        className="
          w-full p-3 bg-blue-600 text-white rounded-md
          hover:bg-blue-700 transition
        "
        onClick={handleNewChat}
      >
        Start New Chat
      </button>

      <div className="space-y-2 mt-6">
        {chats.map((chat) => (
          <div
            key={chat.id}
            onClick={() => onSelectChat(chat.id)}
            className="
              p-3 rounded cursor-pointer hover:bg-gray-200
              dark:hover:bg-[#2a3942] transition
              text-gray-800 dark:text-gray-100
            "
          >
            <p className="font-medium text-ellipsis overflow-clip">{chat?.otherUserName} {chat.isSelfChat ? '(me)':''}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {chat?.otherUserEmail}
            </p>
          </div>
        ))}
      </div>

    </div>
  );
}
