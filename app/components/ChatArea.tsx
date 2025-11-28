import { auth } from "@/firebaseConfig";
import { useAuthState } from "react-firebase-hooks/auth";
import { ChatsData } from "../types/chat";
import Image from "next/image";
import { SendHorizontal } from "lucide-react";

export default function ChatArea({
  chatData,
  onBack,
}: {
  chatData: ChatsData;
  onBack: () => void;
}) {
  const [user] = useAuthState(auth);

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
            ←
          </button>

          <div className="w-12 h-12 relative shrink-0 overflow-hidden rounded-full">
            <Image
              src={chatData.photoURL || "/images/default-avatar.png"}
              alt="chat"
              fill
              className="object-cover"
            />
          </div>

          <div className="ml-3 font-medium flex-1 min-w-0">
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

      <div className="h-full flex flex-col relative">
        <div className="absolute inset-0 bg-[url('/images/wallpaper.png')] bg-cover bg-center brightness-20 z-0" />

        <div className="absolute inset-0 z-10 flex flex-col">
          <div className="flex-1 overflow-auto p-4 bg-transparent pb-24">
            {/* Messages */}
            <div>content</div>
          </div>
          <div
            className="
        absolute bottom-0 left-0 right-0 
        p-4 
        bg-transparent
        flex items-center
      "
          >
            <input
              className="
              focus:outline-none focus:ring-0 focus:border-transparent
          w-full px-3 py-2 pr-12 rounded-full
          bg-[#2a3942]
          text-gray-900 dark:text-gray-100
        "
              placeholder="Type a message"
            />

            <button className="absolute right-4 p-2 bg-[#31DBBC] rounded-full">
              <SendHorizontal className="w-6 h-6 text-[#202c33]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
