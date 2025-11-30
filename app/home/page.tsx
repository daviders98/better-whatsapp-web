"use client";

import { useEffect, useState } from "react";
import SideBar from "../components/SideBar";
import EmptyChat from "../components/EmptyChat";
import ChatArea from "../components/ChatArea";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/firebaseConfig";
import { useRouter } from "next/navigation";
import Loading from "../components/Loading";
import { ChatsData } from "../types/chat";
import { User } from "firebase/auth";

export default function Home() {
  const [user, loading] = useAuthState(auth);
  const [selectedChat, setSelectedChat] = useState<ChatsData | null>(null);
  const router = useRouter();

  const handleBack = () => setSelectedChat(null);
  useEffect(() => {
    if (!user && !loading) {
      router.push("/");
    }
  }, [user, router, loading]);

  return (
    <>
      {loading ? (
        <Loading />
      ) : (
        <div className="flex h-screen w-screen overflow-hidden bg-gray-100 dark:bg-[#01273C]">
          <div
            className={`
          border-r border-gray-300 dark:border-gray-700 
          bg-white dark:bg-[#252f35] h-full
          md:w-[30%] md:min-w-[280px] w-full 
          ${selectedChat ? "hidden md:block" : "block"}
        `}
          >
            <SideBar onSelectChat={setSelectedChat} user={user as User} />
          </div>

          <div
            className={`
          flex-1 bg-[#f0f2f5] dark:bg-[#0b141a] h-full
          ${!selectedChat ? "hidden md:block" : "block w-full"}
        `}
          >
            {!selectedChat ? (
              <EmptyChat />
            ) : (
              <ChatArea chatData={selectedChat} onBack={handleBack} />
            )}
          </div>
        </div>
      )}
    </>
  );
}
