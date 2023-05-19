import React, { useState } from "react";
import { Conversation, User } from "../../typings";
import { currentConversationState } from "@/atoms/chatAtom";
import { useRecoilState } from "recoil";
import useAuth from "@/hooks/useAuth";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { deleteGroup, leaveGroup } from "@/firestore/firestore";

interface Props extends Conversation {
  selected: String | null;
  setSelected: React.ComponentState;
}

const MessagesListItem = ({
  id,
  creator,
  members,
  recentMessage,
  name,
  selected,
  setSelected,
}: Props) => {
  const { user } = useAuth();
  const [currentConversation, setCurrentConversation] = useRecoilState(
    currentConversationState
  );
  const [swipeStarted, setSwipeStarted] = useState(false);

  const isMessageRead = recentMessage?.readBy?.read?.includes(user?.uid || "");

  const handleHover = () => {
    setSelected(id);
  };

  const handleLeave = () => {
    setSelected(null);
  };

  const handleDeleteGroup = () => leaveGroup(id, user?.uid || "");
  return (
    <div className="h-full w-full">
      <div
        className={`relative w-full h-20 flex flex-col transition-transform 300ms ${
          selected ? "-translate-x-1/3" : "translate-x-0"
        }`}
      >
        <button
          className={`w-full h-full z-10 hover:bg-[#ffffff26] flex justify-start items-center space-x-2 pr-2`}
          onMouseEnter={handleHover}
          onTouchStart={handleHover}
          onClick={() => {
            setSelected(null);
            setCurrentConversation({
              id: id,
              members: members,
              creator: creator,
              recentMessage: recentMessage,
              name: name,
            });
          }}
        >
          <div className="w-1/4 flex justify-between items-center">
            <div className="w-full flex justify-center items-center pb-2">
              {!isMessageRead && (
                <div className="rounded-full bg-[#00FFB2] w-2 h-2"></div>
              )}
              {isMessageRead && <div className="w-2 h-2"></div>}
            </div>

            <div className="pb-2 flex justify-center items-center w-full">
              Image
            </div>
          </div>

          <div className="w-3/4 h-full flex flex-col justify-between items-start p-2">
            <div className="h-full text-left font-inter font-medium text-white text-lg line-clamp-1">
              {name}
            </div>

            <div className="h-full font-inter font-normal text-[#D8D8D8] text-sm w-full">
              <p className="text-left line-clamp-2 break-words">
                {recentMessage?.messageText}
              </p>
            </div>
          </div>
        </button>
        <div
          className={`absolute w-1/6 h-full right-0 top-0 z-10 ${
            selected === id ? "hidden" : "absolute"
          }`}
          onMouseOver={handleHover}
        ></div>
        <div
          className={`absolute w-1/3 s -z-0 top-0 bottom-0 right-0 flex justify-center items-center cursor-pointer bg-red-500 shadow-inner shadow-[#ffffff26] translate-x-full`}
          onMouseLeave={handleLeave}
          onTouchCancel={handleLeave}
          onClick={handleDeleteGroup}
        >
          <XMarkIcon className="h-10 w-10" />
        </div>
      </div>
    </div>
  );
};

export default MessagesListItem;
