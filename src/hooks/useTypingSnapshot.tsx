import { doc, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../../firebase";
import { User } from "../../typings";

export const useTypingSnapshot = (id: string) => {
  const [typingArray, setTypingArray] = useState<User[]>([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, "groups", id), (groupDoc) => {
      if (groupDoc.exists()) {
        const groupData = groupDoc.data();
        const typingArrayTemp = groupData?.typing || [];
        // Call a callback function to handle the updated typing array
        setTypingArray(typingArrayTemp);
      } else {
        console.log("Group not found.");
      }
    });

    return () => {
      unsubscribe();
    };
  }, [id]);

  return { typingArray };
};
