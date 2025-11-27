import { useEffect, useState } from "react";
import { auth } from "@/firebaseConfig";
import { useAuthState } from "react-firebase-hooks/auth";
import { getChatOtherUser } from "@/app/lib/chats";

export default function ChatArea({
  chatId,
  onBack,
}: {
  chatId: string;
  onBack: () => void;
}) {
  const [user] = useAuthState(auth);
  const [otherUser, setOtherUser] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    async function loadUser({ email }: { email: string | null }) {
      const otherUserData = await getChatOtherUser(chatId, email);
      if (otherUserData) {
        setOtherUser(otherUserData.email);
      }
    }

    if (user) {
      loadUser({ email: user.email });
    }
  }, [chatId, user]);

  return (
    <div className="h-full flex flex-col">
      {otherUser && (
        <div
          className="
        border-b p-4 flex items-center gap-3
        bg-white dark:bg-[#202c33] 
        text-gray-900 dark:text-gray-100
        border-gray-300 dark:border-gray-700 select-none
      "
        >
          <button onClick={onBack} className="md:hidden text-xl px-2">
            ←
          </button>

          <span>{otherUser}</span>
        </div>
      )}

      <div className="flex-1 overflow-auto p-4">{/* Messages */}</div>

      <div className="p-3 border-t bg-white dark:bg-[#202c33] border-gray-300 dark:border-gray-700">
        <input
          className="
            w-full rounded p-2 
            bg-gray-100 dark:bg-[#2a3942]
            text-gray-900 dark:text-gray-100
            border border-gray-300 dark:border-gray-700
          "
          placeholder="Type a message"
        />
      </div>
    </div>
  );
}
