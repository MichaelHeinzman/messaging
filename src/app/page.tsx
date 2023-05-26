"use client";

import Conversation from "@/components/Conversation";
import ConversationList from "@/components/ConversationsList";
import useAuth from "@/hooks/useAuth";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import Head from "next/head";
import { useEffect, useMemo, useState } from "react";
import { db } from "../../firebase";
import { Conversation as ConversationType } from "../../typings";
import { useRecoilState } from "recoil";
import { currentConversationState } from "@/atoms/chatAtom";
import useConversations from "@/hooks/useConversations";
import { UserCircleIcon } from "@heroicons/react/24/outline";

export default function Home() {
  const { loading, user, logout } = useAuth();
  const [currentConversation, setCurrentConversation] = useRecoilState(
    currentConversationState
  );
  const { conversations } = useConversations();

  const foundConversation = useMemo(
    () =>
      conversations?.find(
        (convo: ConversationType) => convo.id === currentConversation?.id
      ),
    [conversations, currentConversation?.id]
  );

  if (loading) return null;

  return (
    <div className="w-screen h-screen max-h-screen overflow-hidden">
      <Head>
        <title>Messages - Messaging</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex justify-between items-start h-full pt-5 w-full">
        <div
          className={`flex w-full md:w-1/3 lg:w-1/5 h-full ${
            currentConversation !== null && "hidden md:flex "
          } `}
        >
          <ConversationList conversations={conversations} />
        </div>

        {foundConversation && <Conversation {...foundConversation} />}

        <div className={`p-4 hidden justify-end items-center md:flex z-20`}>
          <UserCircleIcon
            className="h-10 w-10 text-white cursor-pointer"
            onClick={logout}
          />
        </div>
      </main>
    </div>
  );
}
