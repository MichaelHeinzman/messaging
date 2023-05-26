import React, { useState } from "react";
import ConversationsListItem from "./ConversationsListItem";
import { Conversation, RecentMessage } from "../../typings";
import { PlusCircleIcon } from "@heroicons/react/24/outline";
import useAuth from "@/hooks/useAuth";
import CreateConversation from "./CreateConversation";

type Props = {
  conversations: Conversation[] | null | undefined;
  fromConversationsPage?: boolean;
};

const Messages = ({ conversations, fromConversationsPage }: Props) => {
  const [searchText, setSearchText] = useState("");
  const [create, setCreate] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);

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

  // Sort conversations based on sentAt timestamp
  const sortConversations = (a: Conversation, b: Conversation) => {
    const aTimestamp = getRecentMessageTimestamp(a.recentMessage);
    const bTimestamp = getRecentMessageTimestamp(b.recentMessage);

    if (aTimestamp > bTimestamp) {
      return -1; // a comes before b
    } else if (aTimestamp < bTimestamp) {
      return 1; // b comes before a
    } else {
      return 0; // no change in order
    }
  };

  const getRecentMessageTimestamp = (message: RecentMessage | null) => {
    return message?.readBy.sentAt || 0;
  };

  const { user } = useAuth();

  return (
    <section className="order-r-2 border-[#ffffff85] h-full w-full space-y-3 py-2 z-20">
      <div className="px-2 font-inter pr-2 font-semibold text-white text-2xl leading-10 flex justify-between">
        <p>Messages</p>
        <p>
          <PlusCircleIcon
            className="h-10 w-10 text-white cursor-pointer"
            onClick={() => setCreate((value) => !value)}
          />
        </p>
      </div>
      {create && <CreateConversation setCreate={setCreate} />}

      <div className="w-full p-2">
        <input
          className="input shadow-none h-5 border-y-[1px] border-[#ffffff75]"
          placeholder="Search"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
      </div>
      <div className="w-full p-2 max-h-screen overflow-y-auto pb-32 scrollbar-hide divide-y-2 divide-[#ffffff85] overflow-hidden">
        {filteredConversations?.sort(sortConversations).map((conversation) => (
          <ConversationsListItem
            key={conversation.id}
            {...conversation}
            selected={selected}
            setSelected={setSelected}
          />
        ))}
      </div>
    </section>
  );
};

export default Messages;
