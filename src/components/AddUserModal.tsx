import React, { useState } from "react";
import UserSearchAsyncSelect from "./UserSearchAsyncSelect";
import { Conversation, User } from "../../typings";
import { updateGroupMembers } from "@/firestore/firestore";

interface Props {
  members: Conversation["members"];
  groupId: Conversation["id"];
}

const AddUserModal = ({ members, groupId }: Props) => {
  const [addedUsers, setAddedUsers] = useState<readonly User[]>([]);

  const handleSelectChange = (options: readonly User[]) =>
    setAddedUsers(options);

  const submit = () => {
    updateGroupMembers(groupId, [
      ...members,
      ...addedUsers.map((user: User) => user.id),
    ]);
    setAddedUsers([]);
  };
  return (
    <div className="input absolute left-0 top-14 bg-[#454545] z-30 w-64 space-y-4">
      <UserSearchAsyncSelect onChange={handleSelectChange} members={members} />
      <button
        className="border-1 bg-[#ffffff26] rounded-md w-full"
        onClick={submit}
      >
        Add Users To Group
      </button>
    </div>
  );
};

export default AddUserModal;
