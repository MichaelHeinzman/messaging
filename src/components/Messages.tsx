import useAuth from "@/hooks/useAuth";
import { useMessageSnapshot } from "@/hooks/useMessageSnapshot";
import React, { useEffect, useRef } from "react";
import Message from "./Message";
import { Conversation } from "../../typings";

interface Props {
  conversationId: Conversation["id"];
  members: Conversation["members"];
}

const Messages = ({ conversationId, members }: Props) => {
  const { user } = useAuth();
  const { messages } = useMessageSnapshot(conversationId, user);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: "smooth",
        inline: "end",
      });
    }
  };

  return (
    <div className="w-full lg:w-[89%] max-h-full h-screen flex flex-col justify-start space-y-2 overflow-y-auto sm:px-3 md:px-6 sticky top-0 scrollbar">
      {messages?.map((message) => (
        <Message key={message.id} {...message} members={members} />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default Messages;
