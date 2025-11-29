import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { auth } from "@/firebaseConfig";
import { useAuthState } from "react-firebase-hooks/auth";
import { ChatsData } from "../types/chat";
import Image from "next/image";
import { ArrowLeft, SendHorizontal } from "lucide-react";
import { sendChatMessage, useChatMessages } from "../lib/chats";
import Conversation from "./Conversation";

export default function ChatArea({
  chatData,
  onBack,
}: {
  chatData: ChatsData;
  onBack: () => void;
}) {
  const [user] = useAuthState(auth);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const { messages } = useChatMessages(chatData.id);

  const memoizedMessages = useMemo(() => messages || [], [messages]);

  const handleSend = useCallback(async () => {
    if (!input.trim() || !user) return;

    sendChatMessage(chatData.id, {
      text: input.trim(),
      sender: user.email!,
    });

    setInput("");
  }, [input, user, chatData.id]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSend();
  };

  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [memoizedMessages]);

  return (
    <div className="h-full flex flex-col">
      {chatData && user && (
        <div
          className="
            border-b p-4 flex items-center
            bg-white dark:bg-[#202c33] 
            text-gray-900 dark:text-gray-100
            border-gray-300 dark:border-gray-700
          "
        >
          <button onClick={onBack} className="md:hidden text-xl px-2">
            <ArrowLeft className="hover:cursor-pointer" />
          </button>

          <div className="w-12 h-12 relative shrink-0 overflow-hidden rounded-full select-none">
            <Image
              src={chatData.photoURL || "/images/default-avatar.png"}
              alt="chat"
              fill
              className="object-cover select-none"
            />
          </div>
          <div className="ml-3 font-medium flex-1 min-w-0 select-none">
            {chatData.type === "me" ? (
              <>
                <p className="overflow-hidden whitespace-nowrap text-ellipsis">
                  {user.displayName}
                </p>
                <p className="overflow-hidden whitespace-nowrap text-ellipsis text-gray-400">
                  Message yourself
                </p>
              </>
            ) : (
              <>
                <p className="overflow-hidden whitespace-nowrap text-ellipsis">
                  {chatData.otherUserName}
                </p>
                <p className="overflow-hidden whitespace-nowrap text-ellipsis text-gray-400">
                  {chatData.otherUserEmail}
                </p>
              </>
            )}
          </div>
        </div>
      )}

      <div className="h-full flex flex-col relative bg-transparent">
        <div className="absolute inset-0 bg-[url('/images/wallpaper.png')] bg-cover bg-center brightness-20 z-0" />

        <div className="absolute inset-0 z-10 flex flex-col bg-transparent">
          <div
            ref={scrollRef}
            className="flex-1 overflow-auto p-4 scrollbar-custom"
          >
            <Conversation messages={memoizedMessages} />
          </div>

          <div
            className="
              px-4 pb-4
              border-transparent
              bg-transparent
              flex items-center
              shadow
            "
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="
                focus:outline-none focus:ring-0 focus:border-transparent
                w-full px-3 py-2 pr-12 rounded-full
                bg-[#2a3942]
                text-gray-900 dark:text-gray-100
              "
              placeholder="Type a message"
            />

            <button
              onClick={handleSend}
              className="absolute right-4 p-2 bg-[#31DBBC] rounded-full"
            >
              <SendHorizontal className="w-6 h-6 text-[#202c33]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
