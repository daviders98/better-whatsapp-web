"use client";

import { getAuth, GoogleAuthProvider, signInWithRedirect } from "firebase/auth";
import React from "react";
import { provider } from "../../firebaseConfig";
import Image from "next/image";

function Login() {
  const signInWithGoogle = () => {
    const auth = getAuth();
    signInWithRedirect(auth, provider)
      .then((result) => {
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const user = result.user;
      })
      .catch((error) => {
        console.error("Login error:", error.message);
      });
  };

  return (
    <div className="flex flex-col md:flex-row items-start justify-center min-h-screen w-full bg-black text-white px-6 py-12 gap-12">

      {/* Left Column */}
      <div className="flex flex-col items-center w-full md:w-1/2 max-w-lg h-full self-center">
        <Image
          src="/images/logo.png"
          alt="Logo"
          width={160}
          height={160}
          className="mb-6"
        />
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
          Better WhatsApp Web
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-gray-300 mb-6">
          A modern, smarter messaging experience. <br/> AI meets messaging.
        </p>
        <button
          onClick={signInWithGoogle}
          className="bg-[#35b5fd] hover:bg-[#32d7bc] text-black font-semibold px-8 py-3 rounded-full shadow-xl transition transform hover:scale-105 hover:cursor-pointer"
        >
          Login with Google
        </button>
      </div>

      {/* Right Column: Feature Grid */}
      <div className="grid grid-cols-3 md:grid-cols-3 gap-6 w-full md:w-1/2 text-center md:text-left self-center">
        <div className="feature-card bg-gray-800/60 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-gray-700">
  <h2 className="text-xl font-semibold mb-2">🔐 Google Login</h2>
  <p className="text-gray-400">Sign in with your Google account and start chatting instantly.</p></div>

        <div className="bg-gray-800/60 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-gray-700">
          <h2 className="text-xl font-semibold mb-2">🧠 AI Conversation Summaries</h2>
          <p className="text-gray-400">
Auto summaries so you always know what you last talked about.
</p>
        </div>

        <div className="bg-gray-800/60 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-gray-700">
          <h2 className="text-xl font-semibold mb-2">🎭 Tone Checker</h2>
          <p className="text-gray-400">Analyze how your message may come across: harsh, unclear, passive, etc.</p>
        </div>

        <div className="bg-gray-800/60 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-gray-700">
          <h2 className="text-xl font-semibold mb-2">⚡ Smart Replies</h2>
          <p className="text-gray-400">Quick AI-powered responses tailored to the conversation.</p>
        </div>

        <div className="bg-gray-800/60 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-gray-700">
          <h2 className="text-xl font-semibold mb-2">✍️ Message Rewrite</h2>
          <p className="text-gray-400">Rewrite messages to be clearer, kinder, more professional, shorter, etc.</p>
        </div>

        <div className="bg-gray-800/60 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-gray-700">
          <h2 className="text-xl font-semibold mb-2">🌍 Auto-Translate</h2>
          <p className="text-gray-400">Translate messages instantly while keeping tone and meaning.</p>
        </div>

        <div className="bg-gray-800/60 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-gray-700">
          <h2 className="text-xl font-semibold mb-2">🎧 Voice Note Transcription</h2>
          <p className="text-gray-400">Summarize long voice notes, your time is valuable.</p>
        </div>
        <div className="bg-gray-800/60 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-gray-700">
          <h2 className="text-xl font-semibold mb-2">🔍 Smart Search</h2>
          <p className="text-gray-400">Search your chats even if you can’t remember how it was written.</p>
        </div>
        <div className="bg-gray-800/60 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-gray-700">
          <h2 className="text-xl font-semibold mb-2">🗂️ Contextual Sidebar</h2>
          <p className="text-gray-400">Live overview of your conversation. See topics, key points, action items, and unanswered questions all in one place.</p>
        </div>
      </div>
    </div>
  );
}

export default Login;
