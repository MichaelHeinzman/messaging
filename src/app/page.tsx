"use client";

import Conversation from "@/components/Conversation";
import Messages from "@/components/Messages";
import useAuth from "@/hooks/useAuth";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import Head from "next/head";
import { useEffect, useState } from "react";
import { db } from "../../firebase";
import { Conversation as ConversationType } from "../../typings";
import { useRecoilState } from "recoil";
import { currentConversationState } from "@/atoms/chatAtom";

export default function Home() {
  const { loading, user, logout } = useAuth();
  const [currentConversation, setCurrentConversation] = useRecoilState(
    currentConversationState
  );
  const [conversations, setConversations] = useState<
    ConversationType[] | null | undefined
  >();

  useEffect(() => {
    if (user) {
      const collectionRef = collection(db, "groups");
      const q = query(
        collectionRef,
        where("members", "array-contains", user?.uid)
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const conversations: Conversation[] = snapshot.docs.map(
          (doc) => doc.data() as Conversation
        );
        setConversations(conversations);
        if (!currentConversation) {
          setCurrentConversation(
            conversations.length > 0 ? conversations[0] : null
          );
        }
      });

      return () => unsubscribe(); // Unsubscribe from the listener when component unmounts or when the dependency changes
    } else {
      setConversations(null);
      setCurrentConversation(null);
    }
  }, [currentConversation, setCurrentConversation, user, user?.uid]);

  if (loading) return null;

  return (
    <div className="w-full h-screen max-h-screen overflow-hidden">
      <Head>
        <title>Messages - Messaging</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex justify-start items-start h-full">
        <div className="hidden md:flex w-1/3 lg:w-1/5 h-full">
          <Messages conversations={conversations} />
        </div>
        {currentConversation && (
          <Conversation
            key={currentConversation.id}
            id={currentConversation.id}
            creator={currentConversation.creator}
            name={currentConversation.name}
            members={currentConversation.members}
            recentMessage={currentConversation.recentMessage}
          />
        )}

        <button
          className="m-2 p-2 cursor-pointer border-2 border-solid border-white rounded-md"
          onClick={logout}
        >
          Logout
        </button>
      </main>
    </div>
  );
}
