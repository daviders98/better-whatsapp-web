import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { auth } from "@/firebaseConfig";
import { useAuthState } from "react-firebase-hooks/auth";
import { ChatsData } from "../types/chat";
import Image from "next/image";
import { ArrowLeft, Languages, SendHorizontal } from "lucide-react";
import { sendChatMessage, useChatMessages } from "../lib/chats";
import Conversation from "./Conversation";
import AItoolsContainer from "./AIToolsContainer";

export default function ChatArea({
  chatData,
  onBack,
}: {
  chatData: ChatsData;
  onBack: () => void;
}) {
  const [user] = useAuthState(auth);

  const [input, setInput] = useState("");
  const [srcLang, setSrcLang] = useState("English");
  const [tgtLang, setTgtLang] = useState("Spanish");

  const [showTools, setShowTools] = useState(false);
  const [warning, setWarning] = useState("");
  const [shake, setShake] = useState(false);

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const warningTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
  useEffect(() => {
    return () => {
      if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (!input.length && showTools) {
      Promise.resolve().then(() => setShowTools(false));
    }
  }, [input, showTools]);

  const triggerWarning = (msg: string) => {
    setWarning(msg);
    setShake(true);

    setTimeout(() => setShake(false), 400);

    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current);
    }

    warningTimeoutRef.current = setTimeout(() => {
      setWarning("");
    }, 2000);
  };

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
            <Conversation
              messages={memoizedMessages}
              photoURL={
                chatData.photoURL || chatData.type == "group"
                  ? "/images/default-group.png"
                  : "/images/default-avatar.png"
              }
              chatType={chatData.type}
            />
          </div>

          <div className="px-4 pb-4 relative">
            <AItoolsContainer
              open={showTools}
              onClose={() => setShowTools(false)}
              input={input}
              setInput={setInput}
              srcLang={srcLang}
              tgtLang={tgtLang}
              setSrcLang={setSrcLang}
              setTgtLang={setTgtLang}
            />

            <div className="w-full bg-[#2a3942] rounded-2xl p-2 flex flex-col gap-2">
              {warning && (
                <div
                  className={`px-2 text-red-400 text-sm ${
                    shake ? "shake" : ""
                  }`}
                >
                  {warning}
                </div>
              )}

              <div className="flex items-center gap-4 px-2">
                <button
                  onClick={() => {
                    if (!input.length) {
                      triggerWarning(
                        "Type a message before using AI translation."
                      );
                      return;
                    }
                    setShowTools(!showTools);
                  }}
                  className="text-gray-300 transition rounded-full p-2 hover:text-white hover:bg-gray-500 hover:cursor-pointer"
                >
                  <Languages className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-center relative">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="
                    flex-1 px-3 py-2 rounded-xl
                    bg-[#1f2c33]
                    text-gray-100 placeholder-gray-400
                    focus:outline-none
                  "
                  placeholder="Type a message"
                />

                <button
                  onClick={handleSend}
                  className="ml-2 p-2 bg-[#31DBBC] rounded-full hover:cursor-pointer"
                >
                  <SendHorizontal className="w-5 h-5 text-[#202c33]" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
