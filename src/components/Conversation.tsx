import React, { useEffect, useRef, useState } from "react";
import Message from "./Message";
import { Conversation } from "../../typings";
import useAuth from "@/hooks/useAuth";
import { Timestamp } from "firebase/firestore";
import { sendMessageInGroup, updateTypingArray } from "@/firestore/firestore";
import { useMessageSnapshot } from "@/hooks/useMessageSnapshot";
import { useTypingSnapshot } from "@/hooks/useTypingSnapshot";
import { useBeforeUnload } from "@/hooks/useBeforeUnload";

const Conversation = ({ members, creator, id, name }: Conversation) => {
  const { user } = useAuth();
  const { messages } = useMessageSnapshot(id, user);
  const { typingArray } = useTypingSnapshot(id);
  const [message, setMessage] = useState<string>("");
  const [typing, setTyping] = useState(false);
  const [sending, setSending] = useState(false);
  const idRef = useRef(id);
  const userRef = useRef(user);

  useBeforeUnload(() =>
    updateTypingArray(idRef.current, userRef.current, "remove")
  );

  useEffect(() => {
    if (message.length > 0 && typing === false) {
      setTyping(true);
      updateTypingArray(id, user, "add");
    }

    if (message.length === 0 && typing === true) {
      setTyping(false);
      updateTypingArray(id, user, "remove");
    }
  }, [id, message, typing, user]);

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

  console.log(typingArray);
  return (
    <section className="w-full md:w-3/4 lg:w-4/6 h-screen flex flex-col justify-start items-center py-5 px-3 space-y-5">
      {/* Title */}
      <div className="relative w-full h-10 flex justify-center">
        <button className="absolute left-0 md:hidden h-full text-center text-xs sm:text-base px-2">
          Back to Messages
        </button>
        <div className="text-center font-inter pr-2 font-semibold text-white text-2xl">
          {name}
        </div>
      </div>

      {/* Messages */}
      <div className="w-full lg:w-[89%] max-h-full h-screen flex flex-col justify-start space-y-2 overflow-y-auto sm:px-3 md:px-6 sticky top-0 scrollbar">
        {messages?.map((message) => (
          <Message key={message.id} {...message} />
        ))}
      </div>
      {/* Typing */}
      {typingArray.length > 0 && (
        <div className="w-4/6 h-4 flex justify-start items-end pl-2 space-x-2">
          <div className="text-sm max-w-full text-center h-full overflow-hidden whitespace-nowrap overflow-ellipsis">
            {typingArray?.map((user) => user.displayName).join(", ")}
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
