"use client";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebaseConfig";
import Loading from "./components/Loading";
import Login from "./components/Login";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { updateUserInChats } from "./lib/chats";
import { User } from "firebase/auth";

export default function Index() {
  const [user, loading] = useAuthState(auth);
  const router = useRouter();

  useEffect(() => {
    const loginProcess = async (user: User) => {
      await updateUserInChats({
        email: user.email!,
        photoURL: user.photoURL,
        name: user.displayName,
        uid: user.uid!,
      });
      router.push("/home");
    };

    if (user) {
      loginProcess(user);
    }
  }, [user, router]);

  if (loading) return <Loading />;
  if (!user) return <Login />;
}
