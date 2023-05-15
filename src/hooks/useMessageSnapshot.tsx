import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Message as MessageType } from "../../typings";
import { db } from "../../firebase";
import { User } from "firebase/auth";
import { markMessageAsReadInGroup } from "@/firestore/firestore";

export const useMessageSnapshot = (id: string, user: User | null) => {
  const [messages, setMessages] = useState<MessageType[] | null>();
  useEffect(() => {
    if (user == null) return;
    const messageRef = collection(db, "message", id, "messages");
    const messagesQuery = query(messageRef, orderBy("timestamp"));

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const messages: MessageType[] = snapshot.docs.map((doc) => {
        const messageData = doc.data() as MessageType;
        if (!messageData.read.includes(user?.uid || "")) {
          // Add user ID to the read array if it's not already present
          messageData.read.push(user?.uid || "");
        }
        return messageData;
      });

      // Pass the most recent message to markMessageAsReadInGroup
      const mostRecentMessage = messages[0]?.id;
      markMessageAsReadInGroup(id, mostRecentMessage, user?.uid || "");
      setMessages(messages);
    });

    return () => {
      unsubscribe();
    };
  }, [id, user, user?.uid]);

  return { messages };
};
