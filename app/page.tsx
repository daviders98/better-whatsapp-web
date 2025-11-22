'use client';
import {useAuthState} from 'react-firebase-hooks/auth'
import {auth} from '../firebaseConfig'
import Loading from "./components/Loading";
import Login from "./components/Login";

export default function Home() {
  const [user,loading] = useAuthState(auth)

  if(loading) return <Loading />
  if(!user) return <Login/>
  return (
    <Home/>
  );
}
