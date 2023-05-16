import useAuth from "@/hooks/useAuth";
import { useMessageSnapshot } from "@/hooks/useMessageSnapshot";
import React from "react";
import Message from "./Message";

type Props = {
  conversationId: string;
};

const Messages = ({ conversationId }: Props) => {
  const { user } = useAuth();
  const { messages } = useMessageSnapshot(conversationId, user);
  return (
    <div className="w-full lg:w-[89%] max-h-full h-screen flex flex-col justify-start space-y-2 overflow-y-auto sm:px-3 md:px-6 sticky top-0 scrollbar">
      {messages?.map((message) => (
        <Message key={message.id} {...message} />
      ))}
    </div>
  );
};

export default Messages;
