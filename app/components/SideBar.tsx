import { useEffect, useState } from "react";
import { auth,db } from "../../firebaseConfig";
import { useAuthState } from "react-firebase-hooks/auth";
import Image from "next/image";


export default function Sidebar({ onSelectChat }: { onSelectChat: (id: string) => void }) {
  const [user,loading] = useAuthState(auth);

  useEffect(() => {
    if (!user && !loading) return;
  }, [user,loading]);

  return (
    <div className="p-4">
      {
        <div
          className="
            p-3 rounded cursor-pointer flex items-center gap-3
            hover:bg-gray-200 dark:hover:bg-[#2a3942]
            text-gray-800 dark:text-gray-100
          "
          onClick={() => {}}
        >
          <Image
            width={48}
            height={48}
            src={user?.photoURL || "/default-avatar.png"}
            alt={`${user?.displayName}`}
            className="w-10 h-10 rounded-full object-cover"
          />
          <span>{user?.displayName} (me)</span>
        </div>
      }
    </div>
  );
}
