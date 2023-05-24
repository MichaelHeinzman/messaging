import React, { useMemo, useState, useEffect, useId } from "react";
import { Conversation, User } from "../../typings";
import { useMessageSnapshot } from "@/hooks/useMessageSnapshot";
import useAuth from "@/hooks/useAuth";
import CirclePacker from "./CirclePacker";
import useGroupMemberProfiles from "@/hooks/useGroupMemberProfiles";

type Props = {
  members: Conversation["members"];
  groupId: Conversation["id"];
};

interface CircleData {
  id: string;
  value: number;
  photoURL: string;
  displayName: string;
}

const GroupImageMembers = ({ members, groupId }: Props) => {
  const { user, getUserData } = useAuth();
  const { messages } = useMessageSnapshot(groupId, user);
  const { userProfiles } = useGroupMemberProfiles(members);

  const data = useMemo(() => {
    const totalMessages = messages?.length || 1;

    const formattedData: CircleData[] = userProfiles.map((profile) => {
      const userMessages =
        messages?.filter((message) => message.sender === user?.uid) || [];
      const messagePercentage = (userMessages.length / totalMessages) * 100;

      return {
        id: profile?.id || "",
        value: messagePercentage,
        photoURL: profile?.photoURL || "",
        displayName: profile?.displayName.charAt(0) || "",
      };
    });

    return {
      id: groupId,
      children: formattedData,
      value: 100,
      displayName: "",
      photoURL: "",
    };
  }, [groupId, messages, user?.uid, userProfiles]);
  return (
    <CirclePacker
      data={data}
      width={50}
      height={50}
      backgroundColor="#ffffff30"
    />
  );
};

export default GroupImageMembers;
