import React, { useEffect, useState } from "react";
import { Conversation, Message as MessageType, User } from "../../typings";
import useAuth from "@/hooks/useAuth";
import { profileImage } from "@/constants/default";
import { CheckIcon, PencilIcon, XMarkIcon } from "@heroicons/react/24/outline";
import {
  deleteMessageInGroup,
  updateMessagesReadArray,
} from "@/firestore/firestore";
import useAnimateInView from "@/hooks/useAnimateInView";

interface Props extends MessageType {
  members: Conversation["members"];
}
const Message = ({ sender, text, id, groupId, members }: Props) => {
  const { user, getUserData } = useAuth();
  const { motion, ref, controls, variants } = useAnimateInView();
  const [writer, setWriter] = useState<User | null>(null);
  const [clicked, setClicked] = useState(false);
  const [deleteClicked, setDeleteClicked] = useState(false);
  const [editClicked, setEdit] = useState(false);
  const [read, setRead] = useState(false);
  const self = sender === user?.uid && true;
  const isMember = members?.includes(sender);
  useEffect(() => {
    // Define an async function to use with the useEffect hook
    const fetchUserData = async () => {
      try {
        // Call the getUserData function
        const userData = await getUserData(sender);

        // Access the retrieved user data here and perform further operations
        setWriter(userData); // Set the writer state with the retrieved user data
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    if (!read) {
      setRead(true);
      updateMessagesReadArray(groupId, id, user?.uid || "");
    }

    fetchUserData();
  }, [getUserData, groupId, id, read, sender, setWriter, user?.uid]);

  const handleDelete = () => deleteMessageInGroup(id, groupId);
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={self ? variants.messageSelf : variants.message}
      className="w-full flex flex-col"
    >
      <div
        className={`w-full  flex ${self ? "justify-end" : "justify-start"}`}
        onClick={() => setClicked((clicked) => self && !clicked)}
      >
        {/* Message */}
        <div className="w-3/4 md:w-4/6 lg:w-2/4 flex cursor-pointer">
          {!self && (
            <div
              className={`w-1/4 h-full flex justify-center items-end order-1
            `}
            >
              <img
                src={writer?.photoURL || profileImage}
                alt="person"
                className="h-8 w-8 rounded-full bg-white"
              />
            </div>
          )}

          <div className="w-full h-full flex flex-col order-1">
            <div
              className={`text-[#D2D2D2] font-normal font-inter text-xs pl-2 ${
                self && "pt-2"
              }`}
            >
              {self
                ? ""
                : isMember
                ? writer?.displayName
                : writer?.displayName + " - Left Conversation"}
            </div>
            <div className="w-full max-w-full bg-[#FFFFFF26] border-2 border-solid border-white rounded-md p-5 break-all">
              {text}
            </div>
          </div>
        </div>
      </div>

      {/* Message is clicked show this. */}
      {clicked && (
        <div
          className={`w-full flex ${self ? "justify-end" : "justify-start"}`}
        >
          <div className="w-3/4 md:w-4/6 lg:w-2/4 flex cursor-pointer">
            <div
              className={`w-1/4 h-full flex justify-center items-end ${
                self ? "order-2" : "order-1"
              }`}
            ></div>

            <div className="w-full h-full flex order-1  space-x-3 p-2">
              {!deleteClicked && !editClicked && (
                <>
                  <PencilIcon
                    className="h-6 w-6"
                    onClick={() => setEdit(true)}
                  />
                  <XMarkIcon
                    onClick={() => setDeleteClicked(true)}
                    className="h-6 w-6 border-2 border-white rounded-full text-red-400"
                  />
                </>
              )}

              {deleteClicked && (
                <div className="flex space-x-2">
                  <span>Are you sure?</span>
                  <XMarkIcon
                    onClick={() => setDeleteClicked(false)}
                    className="h-6 w-6 border-2 border-white rounded-full"
                  />
                  <CheckIcon
                    className="h-6 w-6 border-2 border-white rounded-full"
                    onClick={handleDelete}
                  />
                </div>
              )}

              {editClicked && (
                <div
                  className="flex space-x-2 underline text-center text-xs"
                  onClick={() => setEdit(false)}
                >
                  Cancel
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default Message;
