import React, { useState } from "react";
import ConversationsListItem from "./ConversationsListItem";
import { Conversation } from "../../typings";
import { PlusCircleIcon } from "@heroicons/react/24/outline";
import useAuth from "@/hooks/useAuth";
import CreateConversation from "./CreateConversation";

type Props = {
  conversations: Conversation[] | null | undefined;
};


const Messages = ({ conversations }: Props) => {
  const [searchText, setSearchText] = useState("");
  const [create, setCreate] = useState(false);


  const filteredConversations = conversations?.filter((conversation) => {
    // Filter based on conversation name
    const nameMatches = conversation.name
      .toLowerCase()
      .includes(searchText.toLowerCase());

    // Filter based on conversation members
    const membersMatch = conversation.members.some((member) =>
      member.toLowerCase().includes(searchText.toLowerCase())
    );

    return nameMatches || membersMatch;
  });

  return (
    <section className="border-r-2  border-[#ffffff85] h-full w-full space-y-3 py-2">
      <div className="px-2 font-inter pr-2 font-semibold text-white text-2xl leading-10 flex justify-between">
        <p>Messages</p>
        <p>
          <PlusCircleIcon
            className="h-10 w-10 text-white cursor-pointer"
            onClick={() => setCreate((value) => !value)}
          />
        </p>
      </div>
      {create && (
        <CreateConversation setCreate={setCreate}/>
      )}

      <div className="w-full p-2">
        <input
          className="input shadow-none h-5 border-y-[1px] border-[#ffffff75]"
          placeholder="Search"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
      </div>
      <div className="w-full max-h-screen overflow-y-auto pb-32 scrollbar-hide">
        {filteredConversations?.map((conversation) => (
          <ConversationsListItem key={conversation.id} {...conversation} />
        ))}
      </div>
    </section>
  );
};

export default Messages;
