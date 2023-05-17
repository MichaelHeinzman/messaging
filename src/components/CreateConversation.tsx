import useAuth from '@/hooks/useAuth';
import React, { useState } from 'react'
import { SubmitHandler, useForm } from 'react-hook-form';
import { Conversation, User } from '../../typings';
import { Timestamp } from 'firebase/firestore';
import { createGroup } from '@/firestore/firestore';
import Select from 'react-select/dist/declarations/src/Select';
import useUsersFromFirestore from '@/hooks/useUsersFromFirestore';
import UserSearchAsyncSelect from './UserSearchAsyncSelect';

type Props = {
    setCreate: Function
}
interface Inputs {
    name: string;
    message: string;
  }
const CreateConversation = ({setCreate}: Props) => {
    const { user } = useAuth();
    const {users} = useUsersFromFirestore();
    const [members, setMembers] = useState<readonly User[]>([]);
    const {
      register,
      handleSubmit,
      formState: { errors },
    } = useForm<Inputs>();
    const onSubmit: SubmitHandler<Inputs> = async ({ name, message }) => {
        const newGroup: Conversation = {
          id: "",
          creator: user?.uid || "",
          name: name,
          members: [user?.uid || "", ...members.map((member: User) => member.id)],
          recentMessage: {
            id: "",
            messageText: message,
            readBy: {
              sentAt: Timestamp.now().toDate().toISOString(),
              sentBy: user?.uid || "",
              read: [],
            },
          },
          typing: [],
        };
        await createGroup(newGroup).finally(() => setCreate(false));
      };

  const handleSelectChange = (options: readonly User[]) => setMembers(options);
  // Add the required props to the Select component
  const selectProps = {
    isMulti: true,
    name: "users",
    options: users,
    className: "basic-multi-select",
    classNamePrefix: "select",
    value: null,
    onChange: null,
    inputValue: "",
    onInputChange: null,
    onMenuOpen: null, // Add the onMenuOpen prop
    onMenuClose: null, // Add the onMenuClose prop
    required: false,
  };
  return (
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
    
  <UserSearchAsyncSelect onChange={handleSelectChange}/>  
    <button className="w-3/4 bg-[#FFFFFF26] rounded-md p-2">
      Submit
    </button>
  </form>
  )
}

export default CreateConversation