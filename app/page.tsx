'use client';
import {useAuthState} from 'react-firebase-hooks/auth'
import {auth} from '../firebaseConfig'
import Loading from "./components/Loading";
import Login from "./components/Login";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Index() {
  const [user,loading] = useAuthState(auth)
  const router = useRouter()

  useEffect(()=>{
    if(user){
      router.push('/home')
    }
  },[user,router])

  if(loading) return <Loading />
  if(!user) return <Login/>
}
