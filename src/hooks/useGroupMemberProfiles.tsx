import React, { useEffect, useState } from "react";
import { Conversation, User as UserType } from "../../typings";
import useAuth from "./useAuth";

const useGroupMemberProfiles = (members: Conversation["members"]) => {
  const { user, getUserData } = useAuth();
  const [userProfiles, setUserProfiles] = useState<(UserType | null)[]>([]);

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
  return { userProfiles };
};

export default useGroupMemberProfiles;
