import React, { useMemo, useState, useEffect } from "react";
import { Conversation, User } from "../../typings";
import { useMessageSnapshot } from "@/hooks/useMessageSnapshot";
import useAuth from "@/hooks/useAuth";
import CirclePacker from "./CirclePacker";

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

  const [userProfiles, setUserProfiles] = useState<(User | null)[]>([]);

  useEffect(() => {
    const fetchUserProfiles = async () => {
      const filteredMembers = members.filter((member) => member !== user?.uid);
      const profiles = await Promise.all(
        filteredMembers.map((member: string) => getUserData(member))
      );
      setUserProfiles(profiles);
    };

    fetchUserProfiles();
  }, [getUserData, members, user]);

  const data = useMemo(() => {
    const totalMessages = messages?.length || 1;

    const formattedData: CircleData[] = userProfiles
      .filter((profile) => profile !== null && profile?.photoURL)
      .map((profile) => {
        const userMessages =
          messages?.filter((message) => message.sender === user?.uid) || [];
        const messagePercentage = (userMessages.length / totalMessages) * 100;

        console.log(messagePercentage, totalMessages);
        return {
          id: profile?.displayName.charAt(0) || "",
          value: messagePercentage,
          photoURL: profile?.photoURL || "",
          displayName: profile?.displayName || "",
        };
      });

    return {
      id: "group",
      children: formattedData,
      value: 100,
      displayName: "",
      photoURL: "",
    };
  }, [messages, user?.uid, userProfiles]);

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
