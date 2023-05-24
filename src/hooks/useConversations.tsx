import React, { useEffect, useState } from "react";
import { Conversation } from "../../typings";
import useAuth from "./useAuth";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../../firebase";
import { useRecoilState } from "recoil";
import { currentConversationState } from "@/atoms/chatAtom";

const useConversations = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[] | null>([]);
  const [currentConversation, setCurrentConversation] = useRecoilState(
    currentConversationState
  );

  useEffect(() => {
    if (user) {
      const collectionRef = collection(db, "groups");
      const q = query(
        collectionRef,
        where("members", "array-contains", user?.uid)
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const conversations: Conversation[] = snapshot.docs.map((doc) => {
          return doc.data() as Conversation;
        });
        setConversations(conversations);
      });

      return () => unsubscribe(); // Unsubscribe from the listener when component unmounts or when the dependency changes
    } else {
      setConversations(null);
      setCurrentConversation(null);
    }
  }, [setCurrentConversation, user]);

  return { conversations };
};

export default useConversations;
