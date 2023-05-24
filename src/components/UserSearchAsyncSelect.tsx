import React from "react";
import AsyncSelect from "react-select/async";
import { User } from "../../typings";
import useUsersFromFirestore from "@/hooks/useUsersFromFirestore";
import { ActionMeta, MultiValue } from "react-select";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../firebase";
import useAuth from "@/hooks/useAuth";

type Props = {
  onChange: (option: readonly User[]) => void;
};

const UserSearchAsyncSelect = ({ onChange }: Props) => {
  const { user } = useAuth();
  const { users } = useUsersFromFirestore();

  const filterOptions = (inputValue: string) => {
    return users.filter((user: User) =>
      user.displayName.toLowerCase().includes(inputValue.toLowerCase())
    ).filter((userProfile: User) => user?.uid !== userProfile.id); // Exclude the current user
  };

  return (
    <AsyncSelect
      isMulti
      cacheOptions
      defaultOptions
      loadOptions={(inputValue: string) =>
        Promise.resolve(filterOptions(inputValue))
      }
      onChange={onChange}
      getOptionLabel={(user: User) => user.displayName}
      getOptionValue={(user: User) => user.id}
      placeholder="Search users..."
      className="input rounded-none shadow-none w-full p-2 outline-none border-none placeholder-white"
      classNamePrefix="select"
      styles={{
        control: (provided) => ({
          ...provided,
          backgroundColor: "#454545",
          borderColor: "#ffffff26",
        }),
        option: (provided, state) => ({
          ...provided,
          backgroundColor: state.isSelected ? "#6B7280" : "#454545",
          color: state.isSelected ? "#ffffff" : "#ffffff",
        }),
        menu: (provided) => ({
          ...provided,
          backgroundColor: "#454545",
        }),
        multiValue: (provided) => ({
          ...provided,
          backgroundColor: "#6B7280",
        }),
        multiValueLabel: (provided) => ({
          ...provided,
          color: "#ffffff",
        }),
        multiValueRemove: (provided) => ({
          ...provided,
          color: "#ffffff",
          ":hover": {
            backgroundColor: "#6B7280",
            color: "#ffffff",
          },
        }),
      }}
    />
  );
};

export default UserSearchAsyncSelect;
