import React, { useMemo, useState, useEffect } from "react";
import { Conversation, Message, User } from "../../typings";
import { useMessageSnapshot } from "@/hooks/useMessageSnapshot";
import useAuth from "@/hooks/useAuth";

type Props = {
  members: Conversation["members"];
  groupId: Conversation["id"];
};

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

  const number_of_members = members.length;
  return (
    <div
      className={`rounded-full overflow-hidden w-10 h-10 bg-[#ffffff50] grid grid-flow-col-dense p-${
        number_of_members > 2 && "p-1"
      }`}
    >
      {userProfiles.map((user: User | null, index: number) => (
        <div
          key={user?.id}
          className={`rounded-full overflow-hidden items-center justify-center ${
            index % 2 === 1 && "z-10"
          }`}
        >
          <img
            src={user?.photoURL}
            alt={user?.displayName}
            className={`object-fit w-${
              1 / number_of_members
            } h-full rounded-full`}
          />
        </div>
      ))}
    </div>
  );
};

export default GroupImageMembers;
