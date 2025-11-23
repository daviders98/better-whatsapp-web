'use client';
import {useAuthState} from 'react-firebase-hooks/auth'
import {auth} from '../firebaseConfig'
import Loading from "./components/Loading";
import Login from "./components/Login";
import { useEffect } from 'react';
import Home from './home/page';

export default function Index() {
  const [user,loading] = useAuthState(auth)
  useEffect(()=>{
    console.log(user)
  },[])

  if(loading) return <Loading />
  if(!user) return <Login/>
  return (
    <Home/>
  );
}
