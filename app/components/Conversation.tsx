import React from "react";
import { ChatMessage, FireBaseTimestamp } from "../types/chat";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/firebaseConfig";
import dayjs from "dayjs";

const Conversation = React.memo(function Conversation({
  messages,
}: {
  messages: ChatMessage[];
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
                text-[.7rem] whitespace-pre-wrap wrap-break-word flex text-[#9fb2ab]
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
