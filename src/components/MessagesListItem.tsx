import React from "react";
import { Conversation, User } from "../../typings";
import { currentConversationState } from "@/atoms/chatAtom";
import { useRecoilState } from "recoil";
import useAuth from "@/hooks/useAuth";

const MessagesListItem = ({
  id,
  creator,
  members,
  recentMessage,
  name,
}: Conversation) => {
  const { user } = useAuth();
  const [currentConversation, setCurrentConversation] = useRecoilState(
    currentConversationState
  );
  return (
    <div
      className="w-full h-[80px] flex flex-col"
      onClick={() =>
        setCurrentConversation({
          id: id,
          members: members,
          creator: creator,
          recentMessage: recentMessage,
          name: name,
        })
      }
    >
      <button className="w-full h-full hover:bg-[#ffffff26] flex justify-start items-center space-x-2 pr-2">
        <div className="w-1/4 flex justify-between items-center">
          <div className=" w-full flex justify-center items-center pb-2">
            {!recentMessage?.readBy?.read.includes(user?.uid) && (
              <div className="rounded-full bg-[#00FFB2] w-2 h-2"></div>
            )}
            {recentMessage?.readBy?.read.includes(user?.uid) && (
              <div className="w-2 h-2"></div>
            )}
          </div>

          <div className="pb-2 flex justify-center items-center w-full">
            Image
          </div>
        </div>

        <div className="w-3/4 h-full flex flex-col justify-between items-start p-2">
          <div className="h-full text-left font-inter font-medium text-white text-lg line-clamp-1">
            {/*members.map((user) => user.name).join(" & ")*/}
            {name}
          </div>

          <div className="h-full font-inter font-normal text-[#D8D8D8] text-sm w-full">
            <p className="text-left line-clamp-2 break-words">
              {recentMessage?.messageText}
            </p>
          </div>
        </div>
      </button>
      <div className="w-full flex justify-end">
        <div className="border-y-[1px] border-[#ffffff26] w-full"></div>
      </div>
    </div>
  );
};

export default MessagesListItem;
