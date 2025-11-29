import React from "react";
import { ChatMessage, ChatType, FireBaseTimestamp } from "../types/chat";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/firebaseConfig";
import dayjs from "dayjs";
import Image from "next/image";

const Conversation = React.memo(function Conversation({
  messages,
  photoURL,
  chatType,
}: {
  messages: ChatMessage[];
  photoURL: string;
  chatType: ChatType;
}) {
  const [user] = useAuthState(auth);

  const formatTime = (ts: FireBaseTimestamp): string => {
    const date = new Date(ts.seconds * 1000);

    const localTime = dayjs(date).format("HH:mm");
    return localTime;
  };

  return (
    <div className="space-y-2">
      {messages.map((msg) => {
        const isMe = msg.sender === user?.email;
        return (
          <div
            key={msg.id + msg.sender}
            className={`flex w-full ${isMe ? "justify-end" : "justify-start"}`}
          >
            {!isMe &&
              chatType === "group" &&
              (() => {
                const index = messages.findIndex((m) => m.id === msg.id);
                const prev = messages[index - 1];

                const shouldShowAvatar = !prev || prev.sender !== msg.sender;

                return shouldShowAvatar ? (
                  <Image
                    src={photoURL}
                    width={32}
                    height={32}
                    alt="chat photo"
                    className="rounded-full mr-2 self-start"
                  />
                ) : (
                  <div className="w-8 mr-2" />
                );
              })()}
            <div
              className={`
                max-w-[70%] px-3 py-2 rounded-lg shadow
                text-sm whitespace-pre-wrap wrap-break-word
                ${
                  isMe
                    ? "bg-[#145c4e] text-gray-100"
                    : "bg-white/80 dark:bg-[#2a3942] text-gray-100"
                }
              `}
            >
              {msg.text}
              <span
                className={`
                    w-full
                text-[.65rem] whitespace-pre-wrap wrap-break-word flex text-[#9fb2ab]
                ${isMe ? "justify-end" : "justify-start"}
              `}
              >
                {msg.timestamp && formatTime(msg.timestamp)}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
});

export default Conversation;
