import React, { useState } from "react";
import { Conversation, User } from "../../typings";
import { currentConversationState } from "@/atoms/chatAtom";
import { useRecoilState } from "recoil";
import useAuth from "@/hooks/useAuth";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { deleteGroup, leaveGroup } from "@/firestore/firestore";
import useAnimateInView from "@/hooks/useAnimateInView";
import GroupImageMembers from "./GroupImageMembers";

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
  const isMessageRead = recentMessage?.readBy?.read?.includes(user?.uid || "");

  const handleHover = () => {
    setSelected(id);
  };

  const handleLeave = () => {
    setSelected(null);
  };

  const handleDeleteGroup = () => leaveGroup(id, user?.uid || "");
  return (
    <div
      className={`overflow-hidden h-full w-full   ${
        currentConversation?.id === id && "bg-[#ffffff26]"
      }`}
    >
      <div
        className={`relative rounded-md w-full h-20 flex flex-col transition-transform 300ms ${
          selected === id ? "-translate-x-1/3" : "translate-x-0"
        }`}
      >
        <button
          className={`w-full h-full z-10 hover:bg-[#ffffff26] flex justify-between items-center space-x-1 pl-2`}
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
          <div className="w-2/6 flex justify-between items-center space-x-2">
            <div className="w-full flex justify-center items-center pb-2">
              {!isMessageRead && (
                <div className="rounded-full bg-[#00FFB2] w-2 h-2"></div>
              )}
              {isMessageRead && <div className="w-2 h-2"></div>}
            </div>

            <div className="pb-2 flex justify-center items-center w-full h-full">
              <GroupImageMembers members={members} groupId={id} />
            </div>
          </div>
          <div className="w-5/6 h-full flex flex-col justify-start items-start p-1">
            <div className="h-full text-left font-inter font-medium text-white text-lg line-clamp-1">
              {name}
            </div>

            <div className="h-full font-inter font-normal text-[#D8D8D8] text-sm w-full">
              <p className="text-left line-clamp-2 break-words">
                {recentMessage?.messageText}
              </p>
            </div>
          </div>
          <div
            className={`w-1/6 h-full z-10 ${
              selected === id ? "hidden w-0" : "flex"
            }`}
            onMouseOver={handleHover}
          ></div>
        </button>

        <div
          className={`absolute w-3/6 h-full left-0 top-0 z-10 ${
            selected === id ? "w-full" : "hidden"
          }`}
          onMouseOver={handleLeave}
        ></div>
        <div
          className={`${
            selected === id ? "" : "ml-2"
          }rounded-md absolute w-1/3 s -z-0 top-0 bottom-0 right-0 flex justify-center items-center cursor-pointer bg-red-500 shadow-inner shadow-[#ffffff26] translate-x-full`}
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
