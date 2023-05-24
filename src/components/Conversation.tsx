import React, { useEffect, useRef, useState } from "react";
import { Conversation, Message } from "../../typings";
import useAuth from "@/hooks/useAuth";
import { Timestamp } from "firebase/firestore";
import {
  markMessageAsReadInGroup,
  sendMessageInGroup,
  updateTypingArray,
} from "@/firestore/firestore";
import { useBeforeUnload } from "@/hooks/useBeforeUnload";
import { User } from "firebase/auth";
import { User as UserType } from "../../typings";
import Messages from "./Messages";
import useGroupMemberProfiles from "@/hooks/useGroupMemberProfiles";
import { useRecoilState } from "recoil";
import { currentConversationState } from "@/atoms/chatAtom";

const Conversation = ({
  id,
  name,
  typing: typingArray,
  members,
  recentMessage,
}: Conversation) => {
  const { user } = useAuth();
  const { userProfiles } = useGroupMemberProfiles(members);
  const [message, setMessage] = useState<string>("");
  const [typing, setTyping] = useState(false);
  const [sending, setSending] = useState(false);
  const idRef = useRef(id);
  const userRef = useRef(user);
  const [currentConversation, setCurrentConversation] = useRecoilState(
    currentConversationState
  );
  useEffect(() => {
    markMessageAsReadInGroup(id, recentMessage?.id || "", user?.uid || "");
  }, [id, recentMessage?.id, user?.uid]);
  useBeforeUnload(() =>
    updateTypingArray(idRef.current, userRef.current, "remove")
  );

  useEffect(() => {
    if (message.length > 0 && typing === false) {
      setTyping(true);
      if (!typingArray.some((user2: User) => user2.uid === user?.uid))
        updateTypingArray(id, user, "add");
    }

    if (message.length === 0 && typing === true) {
      setTyping(false);
      updateTypingArray(id, user, "remove");
    }
  }, [id, message, typing, typingArray, user]);

  const handleSend = async () => {
    if (!sending) {
      setSending(true);
      const newMessage = {
        id: "",
        sender: user?.uid || "", // Assuming User.id represents the sender's ID
        timestamp: Timestamp.now().toDate().toISOString(), // Set the timestamp to the current server timestamp
        read: [user?.uid], // Assuming the message is initially unread
        type: "text", // Assuming the new message is of type "text"
        groupId: id,
        text: message, // Assuming inputValue represents the text content of the new message
      };
      setMessage("Sending...");
      await sendMessageInGroup(newMessage as Message, id).finally(() =>
        setMessage("")
      );
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  return (
    <section className="w-full md:w-3/4 lg:w-4/6 h-screen flex flex-col justify-start items-center py-5 px-3 space-y-5">
      {/* Title */}
      <div className="relative w-full h-10 flex md:justify-between">
        <button
          className={`w-1/4 h-full text-center text-xs sm:text-base px-2 md:hidden`}
          onClick={() => setCurrentConversation(null)}
        >
          Back to Messages
        </button>
        <div className="w-1/4  md:flex order-2 md:order-1"></div>
        <div className="w-full text-center font-inter pr-2 font-semibold text-white text-2xl sm:order-1 md:order-2">
          {name}
        </div>
        <div className="hidden md:flex w-1/4 h-full overflow-hidden items-center justify-end space-x-3 order-3">
          {userProfiles.map((profile: UserType | null) => (
            <img
              key={profile?.id}
              src={profile?.photoURL}
              alt="Member Profile"
              className="h-10 w-10 rounded-full object-cover"
            />
          ))}
        </div>
      </div>

      {/* Messages */}
      <Messages conversationId={id} members={members} />

      {/* Typing */}
      {typingArray?.length > 0 && (
        <div className="w-4/6 h-4 flex justify-start items-end pl-2 space-x-2">
          <div className="text-sm max-w-full text-center h-full overflow-hidden whitespace-nowrap overflow-ellipsis">
            {typingArray?.map((user: User) => user.displayName).join(", ")}
          </div>
          <div className="h-full flex justify-start items-end space-x-1">
            <div className="typing-ball animate-pulse animation-delay-75"></div>
            <div className="typing-ball animate-pulse animation-delay-150"></div>
            <div className="typing-ball animate-pulse animation-delay-300"></div>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="w-full h-8 flex justify-between items-center">
        {/* Clip Icon */}
        <div className="w-1/6 h-11 flex justify-end items-center pt-1 pr-3">
          <img
            src="/paperclip.svg"
            alt={"attach"}
            className="h-full cursor-pointer"
          />
        </div>
        {/* Input */}
        <input
          className="input w-4/6 h-full shadow-md rounded-md outline-none p-2"
          placeholder="Message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        {/* Send Icon */}
        <div className="w-1/6 h-11 flex justify-start items-center pl-3">
          <img
            src="/send.svg"
            alt={"attach"}
            className="h-full cursor-pointer "
            onClick={handleSend}
          />
        </div>
      </div>
    </section>
  );
};

export default Conversation;
