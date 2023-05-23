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
    const formattedData: CircleData[] = userProfiles
      .filter((profile) => profile !== null && profile?.photoURL)
      .map((profile) => ({
        id: profile?.displayName.charAt(0) || "",
        value: 1,
        photoURL: profile?.photoURL || "",
        displayName: profile?.displayName || "",
      }));
    return {
      id: "group",
      children: formattedData,
      value: 1,
      displayName: "",
      photoURL: "",
    };
  }, [userProfiles]);

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
