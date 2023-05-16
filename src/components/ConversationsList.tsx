import React, { useState } from "react";
import ConversationsListItem from "./ConversationsListItem";
import { Conversation } from "../../typings";
import { PlusCircleIcon } from "@heroicons/react/24/outline";
import { SubmitHandler, useForm } from "react-hook-form";
import { Timestamp } from "firebase/firestore";
import useAuth from "@/hooks/useAuth";
import { createGroup } from "@/firestore/firestore";
type Props = {
  conversations: Conversation[] | null | undefined;
};
interface Inputs {
  name: string;
  message: string;
}

const Messages = ({ conversations }: Props) => {
  const { user } = useAuth();
  const [searchText, setSearchText] = useState("");
  const [create, setCreate] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>();

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

  const onSubmit: SubmitHandler<Inputs> = async ({ name, message }) => {
    const newGroup: Conversation = {
      id: "",
      creator: user?.uid || "",
      name: name,
      members: [user?.uid || ""],
      recentMessage: {
        id: "",
        messageText: message,
        readBy: {
          sentAt: Timestamp.now().toDate().toISOString(),
          sentBy: user?.uid || "",
          read: false,
        },
      },
      typing: [],
    };
    await createGroup(newGroup).finally(() => setCreate(false));
  };

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
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="w-full bg-[#454545] shadow-inner shadow-[#ffffff26] border-y-[1px] border-[#ffffff26] p-4 flex flex-col justify-center items-center space-y-4"
        >
          <div className="text-lg text-white font-inter font-semibold w-full text-center">
            Create Group
          </div>
          <label className="inline-block w-full">
            <input
              type="text"
              placeholder="Group Name"
              className="input rounded-none shadow-none w-full p-2 outline-none border-none placeholder:text-white"
              {...register("name", { required: true })}
            />
          </label>
          <label className="inline-block w-full">
            <input
              type="text"
              placeholder="Initial Message"
              className="input rounded-none shadow-none w-full p-2 outline-none border-none placeholder:text-white"
              {...register("message", { required: true })}
            />
          </label>

          <button className="w-3/4 bg-[#FFFFFF26] rounded-md p-2">
            Submit
          </button>
        </form>
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
